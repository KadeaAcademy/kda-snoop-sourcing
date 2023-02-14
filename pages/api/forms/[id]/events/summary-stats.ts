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

    const genderRepartitionCOpen = {
      female: {},
      male: {}
    }

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
      select: {
        data: true
      }
    });

    await Promise.all(cOpenEvents.map(async (s) => {


      const candidateResponse  = await prisma.user.findUnique({
          select: {
            gender: true,
          },
          where:  {
            id: s.data["candidateId"]
          }
        })
       const candidate = s.data["candidateId"]
       if(!genderRepartitionCOpen.male[candidate] || !genderRepartitionCOpen.female[candidate] ) {
       candidateResponse.gender === "male" ? genderRepartitionCOpen.male[candidate] = 1 : genderRepartitionCOpen.female[candidate] = 1;
     }
      }));

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
      cSubmissions.map((s) => s.data["candidateId"])
    ).size;

    const genderRepartitionPSubmisson = {
      female: {},
      male: {}
    }
    await Promise.all(cSubmissions.map(async (s) => {


      const candidateResponse  = await prisma.user.findUnique({
          select: {
            gender: true,
          },
          where:  {
            id: s.data["candidateId"]
          }
        })
      const candidate = s.data["candidateId"]
      if(!genderRepartitionPSubmisson.male[candidate] || !genderRepartitionPSubmisson.female[candidate] ) {
      candidateResponse.gender === "male" ? genderRepartitionPSubmisson.male[candidate] = 1 : genderRepartitionPSubmisson.female[candidate] = 1;
    }
  
      }));
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
      pages,
      genderRepartitionCOpen,
      genderRepartitionPSubmisson

    });
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
