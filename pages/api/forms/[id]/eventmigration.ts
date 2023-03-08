import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { processApiEvent, validateEvents } from "../../../../lib/apiEvents";
import { formatPages, getFormPages } from "../../../../lib/utils";
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

        const candidateLastEvent = candidateEvents;
        candidateLastEvent.map((event) => {
          const pageTitle = pagesFormated[event.data["pageName"]]?.title;
          let goodAnswer = 0;
          const length = event.data["submission"]
            ? Object.keys(event.data["submission"]).length
            : 0;
          const isFinanceStep = pageTitle?.toLowerCase().includes("finance");
          let candidateResponse = {};

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
              if (isFinanceStep) {
                if (
                  Object.values(candidateResponse)
                    [Object.values(candidateResponse).length - 1]?.split(" ")[1]
                    ?.replace("*", "")
                    ?.includes("pr")
                ) {
                  submissions[pageTitle] = "p";
                } else {
                  submissions[pageTitle] = parseInt(
                    Object.values(candidateResponse)
                      [Object.values(candidateResponse).length - 1]?.split(
                        " "
                      )[1]
                      ?.replace("*", ""),
                    10
                  );
                }
              } else {
                submissions[pageTitle] = (goodAnswer / length) * 100;
              }
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


        const error = validateEvents(events);
        if (error) {submissions
          const { status, message } = error;
          return res.status(status).json({ error: message });
        }

       
          // event.data =  {...event.data, ...form, submissions}
          events[0].data.type = "scoreSummary";
          events[0].data = {
            ...events[0].data,
            formId,
            formName: form.name,
            submissions,
          };
          
          delete events[0].data.createdAt;
          delete events[0].data.updatedAt;
          delete events[0].data.ownerId;
          delete events[0].data.formType;
          delete events[0].data.answeringOrder;
          delete events[0].data.description;
          delete events[0].data.dueDate;
          delete events[0].data.schema;
          events[0].type = "scoreSummary"
          const candidateEvent = { user: candidate, ...events[0] };

          updateCandidatesEvents.push({
            candidateEvent,
            formId,
            candidateId: candidate.id,
            candidateName: `${candidate.firstname} - ${candidate.email}`,
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
