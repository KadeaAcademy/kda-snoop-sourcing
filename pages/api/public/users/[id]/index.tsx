import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

// PUT /api/public/users/:id
export default async function updateUserRole(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req: req });

  if(req.method === "PUT") {
    if (!session) return res.status(401).json({ message: "Not authenticated" });
    if (session.user.role !== UserRole.ADMIN)
      return res.status(403).json({ message: "Forbidden" });
  }
  else if (req.method === "GET") {
    let userId = +req.query.id;
  
    const usersData = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstLogin: true
      },
    });
    if (!usersData) return res.status(204);
    res.json(usersData);
  }
  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
