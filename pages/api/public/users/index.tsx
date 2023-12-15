import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../../lib/prisma";
import { UserRole } from "@prisma/client";
import getConfig from "next/config";
import { capturePosthogEvent } from "../../../../lib/posthog";
import { hashPassword } from "../../../../lib/auth";
import { createToken } from "../../../../lib/jwt";

const { publicRuntimeConfig } = getConfig();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST /api/public/users
  // Creates a new user
  // Required fields in body: email, password (hashed)
  // Optional fields in body: firstname, lastname
  if (req.method === "POST") {
    let { user, trainingSession } = req.body;
    const password = await hashPassword(publicRuntimeConfig.nextauthSecret);

    user = { ...user, ...{ email: user.email, password } };

    const form = await prisma.form.findFirst({
      where: {
        airtableTrainingSessionId: {
          equals: `${trainingSession}`,
        },
      },
      select: {
        id: true,
      },
    });

    // create user in database
    let candidature = null;
    try {
      const userData = await prisma.user.create({
        data: {
          ...user,
        },
      });

      if (userData && form) {
        candidature = await prisma.candidature.create({
          data: {
            user: { connect: { id: userData?.id } },
            form: { connect: { id: form?.id } },
            submitted: false,
          },
        });
      }
      capturePosthogEvent(user.email, "user created");

      const token = createToken(userData.id, userData.email);

      res.status(200).json({
        message: "Compte créé avec succès",
        formId: form.id,
        id: userData.id,
        email: user.email,
        code: res.statusCode,
        token: encodeURIComponent(token),
      });


    } catch (e) {
      if (e.code === "P2002") {
        let foundUser = await prisma.user.findUnique({
          where: {
            email: user.email
          }, select: {
            id: true,
            email: true
          }
        })
        if (foundUser && form) {
          let existingCandidature = await prisma.candidature.findFirst({
            where: {
              AND: [
                { formId: form.id },
                { userId: foundUser.id }
              ]
            }, select: {
              id: true
            }
          });

          if (existingCandidature) return res.status(409).json({
            error: `un utilisateur avec ${e.meta.target[0] === "email"
              ? "cette adresse e-mail"
              : "ce numéro de téléphone"
              } existe déjà`,
            message: "Compte existant",
            errorCode: e.code,
            code: res.statusCode,
            formId: form.id,
            id: foundUser.id,
            email: foundUser.email,
            token: encodeURIComponent(""),
          });
          candidature = await prisma.candidature.create({
            data: {
              user: { connect: { id: foundUser?.id } },
              form: { connect: { id: form?.id } },
              submitted: false,
            },
          });

          return res.status(409).json({
            error: `un utilisateur avec ${e.meta.target[0] === "email"
              ? "cette adresse e-mail"
              : "ce numéro de téléphone"
              } existe déjà`,
            message: "Compte existant",
            errorCode: e.code,
            code: res.statusCode,
            formId: form.id,
            id: foundUser.id,
            email: foundUser.email,
            token: encodeURIComponent(""),
          });
        }
      } else {
        return res.status(500).json({
          error: e.message,
          errorCode: e.code,
          code: res.statusCode,
          message: "Une erreur s'est produite dans la création du compte"
        });
      }
    }
  }
  // GET /api/public/users
  else if (req.method === "GET") {
    // Check Authentication and user role
    const session = await getSession({ req: req });
    if (!session) return res.status(401).json({ message: "Not authenticated" });

    if (session.user.role === UserRole.PUBLIC)
      return res.status(403).json({ message: "Forbidden" });
    const usersData = await prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        gender: true,
        phone: true,
        whatsapp: true,
        role: true,
      },
    });
    if (!usersData.length) return res.status(204);
    res.json(usersData);
  }
  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}
