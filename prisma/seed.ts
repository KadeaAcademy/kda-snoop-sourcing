import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();
const emailVerified = new Date().toISOString();
const lines = readFileSync("prisma/data.csv", {
  encoding: "utf8",
  flag: "r",
}).split("\n");

async function main() {
  for (const line of lines) {
    let entry = line.split(",");
    process.stdout.write(`${entry[0].trim()},${entry[1].trim()},`);
    entry = entry.map((d) =>
      d
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s{1,}/g, "-")
    );
    const [firstname, lastname, phone] = entry;
    if (phone.length !== 12) {
      console.error(`wrong phone format,${firstname},${lastname},${phone}`);
      console.log();
      continue;
    }

    const email = `${firstname}.${lastname}@enabel.cdr`;
    const password = await hashPassword(phone.substring(3));

    try {
      const user = await prisma.user.create({
        data: { email, emailVerified, firstname, lastname, phone, password },
      });
      console.log(user.email);
    } catch (error) {
      console.error(`duplicate user,${email},${phone}`);
      console.log();
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
