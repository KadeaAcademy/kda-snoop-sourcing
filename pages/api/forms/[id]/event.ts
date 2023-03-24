import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { processApiEvent, validateEvents } from "../../../../lib/apiEvents";
import { formatPages, getFormPages } from "../../../../lib/utils";
import { prisma } from "../../../../lib/prisma";

///api/submissionsession
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
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
  const submissions = {};

  let candidateEvents = await prisma.sessionEvent.findMany({
    where: {
      AND: [
        { type: "pageSubmission" },
        {
          data: {
            path: ["candidateId"],
            equals: session.user.id,
          },
        },
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

  if (req.method === "POST") {
    const { events } = req.body;

    candidateEvents = [...events, ...candidateEvents];
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
                  [Object.values(candidateResponse).length - 1]?.split(" ")[1]
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

    await setCandidateSubmissionCompletedEvent(session.user.id, formId, pagesSubmited, formTotalPages, events);

    const error = validateEvents(events);
    if (error) {
      const { status, message } = error;
      return res.status(status).json({ error: message });
    }
    res.json({ success: true });
      events[0].data = { ...events[0].data, formId, formName: form.name, submissions };
      delete events[0].data.createdAt;
      delete events[0].data.updatedAt;
      delete events[0].data.ownerId;
      delete events[0].data.formType;
      delete events[0].data.answeringOrder;
      delete events[0].data.description;
      delete events[0].data.dueDate;
      delete events[0].data.schema;
      const candidateEvent = { user: session.user, ...events[0] };
      processApiEvent(candidateEvent, formId, session.user.id);
  }
  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
async function setCandidateSubmissionCompletedEvent(id, formId: string, pagesSubmited: any[], formTotalPages: number, events: any) {
  const candidateSubmissionCompleted = await prisma.sessionEvent.findFirst({
    where: {
      AND: [
        { type: "submissionCompletedEvent" },
        {
          data: {
            path: ["candidateId"],
            equals: id,
          },
        },
        {
          data: {
            path: ["formId"],
            equals: formId,
          },
        },
      ],
    },
  });



  if (!candidateSubmissionCompleted &&
    pagesSubmited.length === formTotalPages) {
    events[0].data.type = "submissionCompletedEvent";
    
    await prisma.sessionEvent.create({
      data: {
        type: "submissionCompletedEvent",
        createdAt: new Date(),
        updatedAt: new Date(),
        data: {
          user: id,
          formId,
          candidateId: id
        },
        submissionSession: {
          connect: { id: events[0].data.submissionSessionId },
        },
      },
    });
    events[0].type = "pageSubmissionevents";
  }
}

