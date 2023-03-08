import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["PUT"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const session = await getSession({ req: req });

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.method === "PUT") {
    const { id } = req.body;
    const userReq = req.body
    delete userReq.id

    let updateUser;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user) {
      updateUser = await prisma.user.update({
        where: {
          id,
        },
        data: userReq,
      });
    }
    return res.json(updateUser);
  }
}
