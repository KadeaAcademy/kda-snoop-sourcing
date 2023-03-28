import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { processApiEvent, validateEvents } from "../../../../lib/apiEvents";
import {
  formatPages,
  formatScoreSummary,
  getFormPages,
  mapDecisionStepsValues,
  setCandidateSubmissionCompletedEvent,
} from "../../../../lib/utils";
import { prisma } from "../../../../lib/prisma";
import { computeScore } from "../../../../lib/computeScore";

///api/submissionsession
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const formId = req.query.id.toString();

  const noCodeForm = await prisma.noCodeForm.findUnique({
    where: {
      formId,
    },
    select: {
      blocks: true,
    },
  });

  const form = await prisma.form.findUnique({
    where: {
      id: formId,
    },
  });

  const pages = getFormPages(noCodeForm.blocks, formId);
  const pagesFormated = formatPages(pages);

  const sessionEventsData = await prisma.sessionEvent.findMany({
    where: {
      type: "formOpened",
      data: {
        path: ["formId"],
        equals: formId,
      },
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
  });
  const candidates = await prisma.user.findMany({
    where: {
      id: {
        in: sessionEventsData.map((event) => event.data["candidateId"]),
      },
    },
  });

  const updateCandidatesEvents = [];

  const allEvents = await prisma.sessionEvent.findMany({
    where: {
      AND: [
        { type: "pageSubmission" },

        {
          data: {
            path: ["formId"],
            equals: formId,
          },
        },
      ],
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });

  Promise.all(
    candidates.map(async (candidate) => {
      const submissions = {};
      if (req.method === "POST") {
        const { events } = req.body;

        const candidateEvents = allEvents.filter(({ data }) => {
          return data?.candidateId === candidate.id;
        });
        let pagesSubmited = [];
        const formTotalPages = Object.keys(pagesFormated).length - 1;

        candidateEvents.map((event) => {
          const pageTitle = pagesFormated[event.data["pageName"]]?.title;
          let goodAnswer = 0;
          const length = event.data["submission"]
            ? Object.keys(event.data["submission"]).length
            : 0;
          const isFinanceStep = pageTitle?.toLowerCase().includes("finance");
          let candidateResponse = {};

          const ispageExistInPagesSubmited = pagesSubmited.findIndex(
            (title) => title === pageTitle
          );
          if (ispageExistInPagesSubmited < 0 && pageTitle)
            pagesSubmited.push(pageTitle);

          if (pageTitle?.toLowerCase().includes("test") || isFinanceStep) {
            if (event.data["submission"]) {
              Object.keys(event.data["submission"]).map((key) => {
                const submission = {};
                const response = event.data["submission"][key];
                goodAnswer =
                  pagesFormated[event.data["pageName"]].blocks[key]?.data
                    ?.response === response
                    ? goodAnswer + 1
                    : goodAnswer;

                const question =
                  pagesFormated[event.data["pageName"]].blocks[key]?.data.label;
                submission[question] = response;
                candidateResponse[question] = response;
              });
              // event.data["submission"]["score"] = goodAnswer / length;
              mapDecisionStepsValues(isFinanceStep, candidateResponse, submissions, pageTitle, goodAnswer, length);
            }
          }
        });

        Object.values(pagesFormated).map(({ title }) => {
          if (
            title &&
            !submissions[title] &&
            title.toLowerCase().includes("test")
          ) {
            submissions[title] = 0;
          } else if (title && !submissions[title]) {
            submissions[title] = "";
          }
        });

        await setCandidateSubmissionCompletedEvent(
          candidate.id,
          formId,
          pagesSubmited,
          formTotalPages,
          events
        );

        const error = validateEvents(events);
        if (error) {
          submissions;
          const { status, message } = error;
          return res.status(status).json({ error: message });
        }

          formatScoreSummary(events, formId, form, submissions);
          events[0].type = "scoreSummary";
          const candidateEvent = { user: candidate, ...events[0] };

          updateCandidatesEvents.push({
            candidateEvent,
            formId,
            candidateId: candidate.id,
            candidateName: `${candidate.firstname} - ${candidate.lastname}`,
          });
      } else {
        throw new Error(
          `The HTTP ${req.method} method is not supported by this route.`
        );
      }
    })
  ).then(() => {
    syncCandidatesEvents(updateCandidatesEvents);
  });

  let flag = 0;
  const NB_QUERIES = 1;
  const syncCandidatesEvents = (updateCandidatesEvents) => {
    Promise.all(
      updateCandidatesEvents
        .slice(flag, flag + NB_QUERIES)
        .map((updateCandidateEvent) => {
          return processApiEvent(
            updateCandidateEvent.candidateEvent,
            updateCandidateEvent.formId,
            updateCandidateEvent.candidateId
          );
        })
    ).then(() => {
      flag += NB_QUERIES;
      if (flag < updateCandidatesEvents.length) {
        setTimeout(() => {
          syncCandidatesEvents(updateCandidatesEvents);
        }, 1000);
      }
    });
  };

  // await  processApiEvent(candidateEvent, formId, candidate.id);

  res.json({ success: true });
}



