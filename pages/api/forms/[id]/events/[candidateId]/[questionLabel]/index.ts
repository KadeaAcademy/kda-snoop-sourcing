import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { prisma } from "../../../../../../../lib/prisma";
import { generateId, isBlockAQuestion } from "../../../../../../../lib/utils";

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
  const questionLabel = req.query.questionLabel.toString();
  const pageId = req.query.candidateId.toString();
  const session = await getSession({ req: req });


  // GET /api/forms/[id]/events/[pageId]/question-stats
  // Gets all page submission statistics for a specific form
  if (req.method === "GET") {
    // check if session exist
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const pageSubmissions = await prisma.sessionEvent.findMany({
      select: {
        data: true,
      },
      where: {
        AND: [
          { type: "pageSubmission" },
          {
            data: {
              path: ["pageName"],
              equals: pageId,
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
          updatedAt: "desc",
        },
      ],
    });
    const candidates = await Promise.all(pageSubmissions.map(async (s, index) => {


    const candidateResponse  = await prisma.user.findUnique({
        select: {
          firstname: true,
          lastname: true,
          gender: true,
          email: true,
          whatsapp: true,
        },
        where:  {
          id: s.data["candidateId"]
        }
      })
      return {...candidateResponse, submission: pageSubmissions[index].data?.submission};

    }));
    
    const pages = await prisma.noCodeForm.findUnique({
      where: {
        formId,
       
      },
      select: {
        blocks: true
      }
    })

  const formPages = [];
  const {blocks} = pages;
    let currentPage = {
      id: formId, // give the first page the formId as id by default
      blocks: [],
    };
    if (blocks) {
      for (const block of blocks) {
        if (block.type !== "pageTransition") {
          currentPage.blocks.push(block);
        } else {
          currentPage.blocks.push({
            id: generateId(10),
            data: {
              label: block.data.submitLabel,
            },
            type: "submitButton",
          });
          formPages.push(currentPage);
          currentPage = {
            id: block.id,
            blocks: [],
          };
        }
      }
    }
    const page = formPages.filter(({id}) => id === pageId)

    const pageQuestions = page[0].blocks.filter((b) => isBlockAQuestion(b));
    


    const Data = []
    let male = 0;
    let female = 0;
    candidates.map((r) => {
        if(r){
          Object.keys(r.submission).map((submissionId) => {
            const submissionFind = pageQuestions.find(({id}) => id === submissionId)
           if(submissionFind) {
            r.submission[submissionFind.data.label] =  r.submission[submissionId];
            delete  r.submission[submissionId];
           }
          })
          r["Soumissions"] = JSON.stringify(r.submission);
          delete r.submission
          r.gender === "male" ? male += 1: female += 1;
      }
        Data.push(r)
    });
   

    return res.json({male, female, Data});
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
