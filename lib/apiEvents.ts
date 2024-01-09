import { handleAirtable } from "../components/pipelines/airtable";
import { handleWebhook } from "../components/pipelines/webhook";
import { capturePosthogEvent } from "./posthog";
import { prisma } from "./prisma";
import { ApiEvent, SchemaPage } from "./types";

type validationError = {
  status: number;
  message: string;
};

export const validateEvents = (
  events: ApiEvent[]
): validationError | undefined => {
  if (!Array.isArray(events)) {
    return { status: 400, message: `"events" needs to be a list` };
  }
  for (const event of events) {
    if (
      ![
        "createSubmissionSession",
        "pageSubmission",
        "submissionCompleted",
        "formOpened",
        "scoreSummary",
        "updateSchema",
      ].includes(event.type)
    ) {
      return {
        status: 400,
        message: `event type ${event.type} is not suppported`,
      };
    }
    return;
  }
};

export const processApiEvent = async (event: ApiEvent, formId, candidateId) => {
  let userOpenFormSession = null;
  let eventDataDefault = {
    "6. Choisis ta vacation": "",
    "5. Test de français": ""
  };
  // save submission
  if (event.type === "pageSubmission") {
    const pageSubmited = event.data;

    event.data["submissions"] = {
      ...eventDataDefault,
      ...event.data["submissions"]
    };

    const sessionEvent = await prisma.sessionEvent.findFirst({
      where: {
        AND: [
          { data: { path: ["formId"], equals: formId } },
          { data: { path: ["candidateId"], equals: candidateId } },
          { data: { path: ["pageName"], equals: event.data.pageName } },
        ],
      },
    });

    if (sessionEvent) {
      sessionEvent.data = pageSubmited;
      await prisma.sessionEvent.update({
        where: {
          id: sessionEvent.id,
        },
        data: {
          data: { ...sessionEvent.data, formId, candidateId },
        },
      });
    } else {
      await prisma.sessionEvent.create({
        data: {
          type: "pageSubmission",
          data: {
            formId,
            candidateId,
            ...pageSubmited,
          },
          submissionSession: {
            connect: { id: pageSubmited.submissionSessionId },
          },
        },
      });
    }

    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
    });
    capturePosthogEvent(form.ownerId, "pageSubmission received", { formId });
    // sendTelemetry("pageSubmission received");
  } else if (event.type === "submissionCompleted") {
    // TODO
  } else if (event.type === "updateSchema") {
    //const data = { schema: event.data, updatedAt: new Date() };

    const form = await prisma.form.findUnique({ where: { id: formId } });
    // TODO find way to fix this code
    // const schema = form.schema as Schema;

    // const data = {
    //   schema: [...event.data.pages, ...schema.pages],
    //   updatedAt: new Date(),
    // };

    const schema = form.schema as SchemaPage[];

    let data = {
      schema: [],
      updatedAt: new Date(),
    };
    if (schema.length) {
      data.schema = [...event.data.pages, ...schema];
    } else {
      data.schema = [...event.data.pages];
    }

    await prisma.form.update({
      where: { id: formId },
      data,
    });
  } else if (event.type === "formOpened") {
    // check if usr  opened form

    userOpenFormSession = await prisma.sessionEvent.findFirst({
      where: {
        type: "formOpened",
        AND: [
          {
            data: {
              path: ["formId"],
              equals: formId,
            },
          },
          {
            data: {
              path: ["candidateId"],
              equals: candidateId,
            },
          },
        ],
      },
    });

    if (userOpenFormSession === null) {
      const { id } = await prisma.submissionSession.create({
        data: { form: { connect: { id: formId } } },
      });

      await prisma.sessionEvent.create({
        data: {
          type: "formOpened",
          data: {
            formId,
            candidateId,
            roll: event.data.roll,
          },
          submissionSession: { connect: { id } },
        },
      });
    }
  } else if (event.type === "scoreSummary"){
    //
  } else {
    throw Error(
      `apiEvents: unsupported event type in event ${JSON.stringify(event)}`
    );
  }
  // handle integrationsforms
  const pipelines = await prisma.pipeline.findMany({
    where: {
      form: { id: formId },
      enabled: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  for (const pipeline of pipelines) {
    if (pipeline.type === "WEBHOOK") {
      handleWebhook(pipeline, event);
    } else if (pipeline.type === "AIRTABLE") {
      if (event.type !== "formOpened") {
        const { dob: dateOfBirth, ...rest } = event['user'];
        event['user'] = { ...rest, dob: dateOfBirth, dateOfBirth };
        delete event['user'].dob;
        handleAirtable(pipeline, event);
      } else if (event.type === "formOpened" && userOpenFormSession === null) {
        handleAirtable(pipeline, event);
      }
    }
  }
};
