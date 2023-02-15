import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { prisma } from "../../../../../../../../lib/prisma";

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
  const endDate =new Date( req.query.endDate.toString()).setHours(23,59,59,59);
  const startDate = new Date(req.query.startDate.toString()).setHours(0,0,0,0);
  const session = await getSession({ req: req });


  // GET /api/forms/[formId]/events/summary-stats
  // Gets summary stats for a form
  if (req.method === "GET") {
    // check if session exist
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const cOpenEvents = await prisma.sessionEvent.count({
      where: {
        AND: [
          { type: "formOpened" },
          {
            data: {
              path: ["formId"],
              string_contains: formId,
            },
          },
             
          { createdAt: { lte:new Date(new Date(endDate).toUTCString()) , gte: new Date(new Date(startDate).toUTCString()) } },
        ],
      },
    });


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
          { createdAt: { lte: new Date(endDate), gte: new Date(startDate) } },
        ],
        
      },
    });
    const countSubmitted = new Set(
      cSubmissions.map((s) => s.data["candidateId"])
    ).size;
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
          { createdAt: { lte: new Date(endDate), gte: new Date(startDate) } },
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
      opened: cOpenEvents,
      submitted: countSubmitted,
      pages
    });
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
