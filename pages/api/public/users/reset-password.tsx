import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../lib/jwt";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST /api/public/users/reset-password
  // Resets a users password
  // Required fields in body: token, hashedPassword
  if (req.method === "POST") {
    const { token, hashedPassword } = req.body;

    try {
      const { id } = await verifyToken(token)
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          emailVerified: true,
          email: true
        }
      });

      if (!user) {
        return res.status(404).json({
          error: "Aucun utilisateur trouvé avec cet ID",
        });
      }

      const emailVerified = user.emailVerified || new Date().toISOString();
      const updated = await prisma.user
        .update({
          where: { id: user.id },
          data: { password: hashedPassword, emailVerified  },
        })
      // await sendPasswordResetNotifyEmail(user);
      res.status(200).json({ updated, email: user.email });


    } catch (e) {
      return res.status(500).json({
        error: "Jeton invalide fourni ou qui n'est plus valide",
        e,
      });
    }
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}