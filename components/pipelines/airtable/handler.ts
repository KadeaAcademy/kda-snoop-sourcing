import { Pipeline, Prisma } from "@prisma/client";
import { ApiEvent } from "../../../lib/types";

const sendData = async (pipeline: Pipeline, event: ApiEvent) => {
  try {
    const airtableData = pipeline.data as Prisma.JsonObject;
    const body = { time: Math.floor(Date.now() / 1000), event };
    fetch(airtableData.endpointUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.log(error);
  }
};

export async function handleAirtable(pipeline: Pipeline, event: ApiEvent) {
  if (pipeline.data.hasOwnProperty("endpointUrl")) {
    if (
      ["pageSubmission", "scoreSummary"].includes(event.type) &&
      pipeline.events.includes("PAGE_SUBMISSION")
    ) {
      delete event.data.submission;
      await sendData(pipeline, event);
    } else if (
      event.type === "formOpened" &&
      pipeline.events.includes("FORM_OPENED")
    ) {
      await sendData(pipeline, event);
    }
  }
}
