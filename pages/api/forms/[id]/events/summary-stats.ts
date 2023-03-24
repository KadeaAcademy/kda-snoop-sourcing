import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { prisma } from "../../../../../lib/prisma";

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
  const session = await getSession({ req: req });

  // GET /api/forms/[formId]/events/summary-stats
  // Gets summary stats for a form
  if (req.method === "GET") {
    // check if session exist
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const candidatesOpened = [];
    const candidatesSubmitted = [];
    const candidatesFinished = [];
    const cOpenEvents = await prisma.sessionEvent.findMany({
      where: {
        AND: [
          { type: "formOpened" },
          {
            data: {
              path: ["formId"],
              string_contains: formId,
            },
          },
        ],
      },
    });

    const cFinishedEvents = await prisma.sessionEvent.findMany({
      where: {
        AND: [
          { type: "submissionCompletedEvent" },
          {
            data: {
              path: ["formId"],
              string_contains: formId,
            },
          },
        ],
      },
    });


    await Promise.all(cFinishedEvents.map(async({data}) => {
      const candidate = await prisma.user.findUnique({
        select: {
          firstname: true,
          lastname: true,
          gender: true,
          phone: true,
          email: true,
          whatsapp: true,
        },
        where: {
          id: data.candidateId
        }
      })
      candidatesFinished.push(candidate)
    }))


    await Promise.all(cOpenEvents.map(async({data}) => {
      const candidate = await prisma.user.findUnique({
        select: {
          firstname: true,
          lastname: true,
          gender: true,
          phone: true,
          email: true,
          whatsapp: true,
        },
        where: {
          id: data.candidateId
        }
      })
      candidatesOpened.push(candidate)
    }))
    
    const cSubmissions = await prisma.sessionEvent.findMany({
      select: {
        data: true,
      },
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
    });
    const countSubmitted = new Set(
      cSubmissions.map((s) => {
        return s.data["candidateId"]
      })
    ).size;

    await Promise.all(cSubmissions.map(async({data}) => {
      const candidate = await prisma.user.findUnique({
        select: {
          firstname: true,
          lastname: true,
          gender: true,
          phone: true,
          email: true,
          whatsapp: true,
        },
        where: {
          id: data.candidateId
        }
      })
      candidatesSubmitted.push(candidate)
    }))


    const cPageSubmission = await prisma.sessionEvent.findMany({
      select: {
        data: true,
      },
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
    });
    let pages = {};
    cPageSubmission.map((s) => {
      if (pages[s.data["pageName"]]) {
        pages[s.data["pageName"]] += 1;
      } else {
        pages[s.data["pageName"]] = 1;
      }
    });

    return res.json({
      opened: cOpenEvents.length,
      submitted: countSubmitted,
      finished: cFinishedEvents.length,
      pages,
      candidatesOpened,
      candidatesSubmitted,
      candidatesFinished
    });
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
