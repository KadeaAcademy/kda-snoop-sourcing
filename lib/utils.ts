import intlFormat from "date-fns/intlFormat";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import AWS from "aws-sdk";
import { prisma } from "../lib/prisma";

export const fetcher = async (url) => {
  const res = await fetch(url);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const shuffle = (array) => {
  array = [...array];
  let currentIndex = array.length,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
export const upload = async (file) => {
  const endpointUrl = process.env.NEXT_PUBLIC_APP_DO_END_POINT;
  const S3 = new AWS.S3({
    endpoint: endpointUrl,
    accessKeyId: process.env.NEXT_PUBLIC_APP_DO_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_APP_DO_SECRET_KEY,
  });

  const params = {
    Body: file,
    Bucket: process.env.NEXT_PUBLIC_APP_BUCKET_NAME,
    Key: `${new Date()}-${file.name}`,
    ACL: "public-read",
  };

  return S3.upload(params, async (err, data) => {
    if (err) alert(err);
    else return data;
  }).promise();
};
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(" ");

  return value
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, "-"); // separator
};

// export const handlePhoneNumberValidity = (phone) => {
//   const validity = /^(\+243|243)[0-9]{9}$/.test(phone);
//   if (validity === false)
//     throw new Error("Entrez le numéro au format +243 xxx xxx xxx");
//   return phone;
// };
export const handlePhoneNumberValidity = (phone, name) => {
  const phoneReg1 = /^(243|\+243|0|00243)([0-9]{9})$/;
  const phoneReg2 = /^([0-9]{9})$/;
  if (phoneReg1.test(phone)) {
    if (phone.startsWith("+")) return phone;
    if (phone.startsWith("00")) return `+${phone.split("").slice(2).join("")}`;
    if (phone.startsWith("0"))
      return `+243${phone.split("").slice(1).join("")}`;
    return `+${phone}`;
  }
  if (phoneReg2.test(phone)) return `+243${phone}`;
  else{
    throw new Error(`${name}: Entrez un numéro valide`);
  }
};

export const getFieldSetter = (obj, objSetter) => {
  return (input, field) => setField(obj, objSetter, input, field);
};

export const setField = (obj, objSetter, input, field) => {
  let newData = JSON.parse(JSON.stringify(obj));
  newData[field] = input;
  objSetter(newData, false);
  return newData;
};

export const convertDateString = (dateString: string) => {
  const date = new Date(dateString);
  return intlFormat(
    date,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    {
      locale: "en",
    }
  );
};

export const convertDateTimeString = (dateString: string) => {
  const date = new Date(dateString);
  return intlFormat(
    date,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
    {
      locale: "en",
    }
  );
};

export const convertTimeString = (dateString: string) => {
  const date = new Date(dateString);
  return intlFormat(
    date,
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    },
    {
      locale: "en",
    }
  );
};

export const timeSince = (dateString: string) => {
  var date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return formatDistance(date, new Date(), {
    addSuffix: true,
    locale: fr,
  });
};

export const generateId = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const hashString = (string: string) => {
  return crypto
    .createHash("sha256")
    .update(string)
    .digest("hex");
};

export const isNotAdmin = (session, res) => {
  if (session.user.role !== UserRole.ADMIN) {
    return res.status(403);
  }
};
export const isAdmin = (user) => {
  return user.role === UserRole.ADMIN;
};

function diff_minutes(dt2: Date, dt1: Date) {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return diff;
}

export const getLeftTime = (startDate: Date, time: number) => {
  const finshDate = +startDate + time * 1000 * 60;
  return diff_minutes(new Date(finshDate), new Date());
};

export const findTimer = (page, startDate: Date) => {
  const timer = page.blocks.find((e) => e.type === "timerToolboxOption")?.data
    .timerDuration;
  return getLeftTime(startDate, timer || 0) * 1000 * 60;
};

export const isTimedPage = (page) => {
  return page.blocks.find((e) => e.type === "timerToolboxOption")?.data
    .timerDuration;
};

export const isBlockAQuestion = ({ type }) => {
  return /Question/.test(type);
};

export const isPageTimerCompleted = ({ blocks }, pageSubmission) => {
  return blocks.filter((block) => {
    if (
      /timerToolboxOption/.test(block.type) &&
      pageSubmission?.data?.pageName
    ) {
      return true;
    }
  }).length;
};

// export const isBlockAQuestion = ({ type }) => {
//   return /Question/.test(type);
// };
// "timerToolboxOption"

export const getPageSubmission = (
  candidateSubmissions: any,
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    role: string;
    gender: string;
  },
  page: any
) => {
  return candidateSubmissions.find(
    (submission) =>
      submission.data.candidateId === user.id &&
      submission.data.pageName === page.id
  );
};

export const getFormState = (pages, candidateSubmissions, user) => {
  const formProgress = {
    pageFinished: 0,
    totalPages: pages.length - 1,
  };

  pages.map((page) => {
    if (candidateSubmissions) {
      const pageSubmission = getPageSubmission(
        candidateSubmissions,
        user,
        page
      );

      if (isPageTimerCompleted(page, pageSubmission)) {
        formProgress.pageFinished += 1;
      } else {
        const responsesCounter = !pageSubmission?.data?.submission
          ? 0
          : Object.values(pageSubmission?.data?.submission).filter((v) => v)
              .length;
        const questionsCounter = page.blocks.filter((block) =>
          isBlockAQuestion(block)
        ).length;
        formProgress.pageFinished +=
          responsesCounter === questionsCounter && responsesCounter > 0 ? 1 : 0;
      }
    }
  });
  return formProgress;
};

export const getFormPages = ( blocks, formId ) => {
  const pages = [];
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
        pages.push(currentPage);
        currentPage = {
          id: block.id,
          blocks: [],
        };
      }
    }
  }
  pages.push(currentPage);

  return pages;
}

export const reformatBlocks = (blocks) => {
  let tempBlocks = {};
  blocks.forEach((block) => {
    tempBlocks[block.id] = { type: block.type, data: block.data };
  });
  return tempBlocks;
}

export const formatPages = (pages: any[]) => {
  let tempPages = {};
  pages.forEach((page) => {
    tempPages[page.id] = {
      title: page.blocks[0].data.text,
      blocks: reformatBlocks(page.blocks),
    };
  });
  return tempPages;
}

export const mapDecisionStepsValues = (
  isFinanceStep: any,
  candidateResponse: {},
  submissions: {},
  pageTitle: any,
  goodAnswer: number,
  length: number,
  submission: {}
) => {
  if (isFinanceStep) {
    if (
      Object.values(candidateResponse)
        [Object.values(candidateResponse).length - 1]?.split(" ")[1]
        ?.replace("*", "")
        ?.includes("pr")
    ) {
      submissions[pageTitle] = "p";
    } 
    else {
      submissions[pageTitle] = parseInt(
        Object.values(candidateResponse)
          [Object.values(candidateResponse).length - 1]?.split(" ")[1]
          ?.replace("*", ""),
        10
      );
    }

  }     else if(pageTitle.toLowerCase().includes("test")){

    submissions[pageTitle] = (goodAnswer / length) * 100;
  } 
else {
submissions[pageTitle] = submission;
}
};


export const computeStepScore = (
  pageTitle: any,
  isFinanceStep: any,
  event,
  goodAnswer: number,
  pagesFormated: {},
  candidateResponse: {},
  submissions: {},
  length: number,
  isAdminiInfos: boolean

) => {
  if (pageTitle?.toLowerCase().includes("test") || isFinanceStep || isAdminiInfos) {
    const submission = {};
    if (event.data["submission"]) {
      Object.keys(event.data["submission"]).map((key) => {
        const response = event.data["submission"][key];
        goodAnswer =
          pagesFormated[event.data["pageName"]].blocks[key]?.data?.response ===
          response
            ? goodAnswer + 1
            : goodAnswer;

        const question =
          pagesFormated[event.data["pageName"]].blocks[key]?.data.label;
        submission[question] = response;
        candidateResponse[question] = response;
      });
      mapDecisionStepsValues(
        isFinanceStep,
        candidateResponse,
        submissions,
        pageTitle,
        goodAnswer,
        length,
        submission,
        
      );
    }
  }
  return goodAnswer;
};

export const formatScoreSummary = (
  events: any,
  formId: string,
  form,
  submissions: {}
) => {
  events[0].data = {
    ...events[0].data,
    formId,
    formName: form.name,
    submissions,
  };

  delete events[0].data.createdAt;
  delete events[0].data.updatedAt;
  delete events[0].data.ownerId;
  delete events[0].data.formType;
  delete events[0].data.answeringOrder;
  delete events[0].data.description;
  delete events[0].data.dueDate;
  delete events[0].data.schema;
};

export async function setCandidateSubmissionCompletedEvent(
  id,
  formId: string,
  pagesSubmited: any[],
  formTotalPages: number,
  events: any
) {
  const candidateSubmissionCompleted = await prisma.sessionEvent.findFirst({
    where: {
      AND: [
        { type: "submissionCompletedEvent" },
        {
          data: {
            path: ["candidateId"],
            equals: id,
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
  });

  if (
    !candidateSubmissionCompleted &&
    pagesSubmited.length === formTotalPages
  ) {
    events[0].data.type = "submissionCompletedEvent";
    await prisma.sessionEvent.create({
      data: {
        type: "submissionCompletedEvent",
        createdAt: new Date(),
        updatedAt: new Date(),
        data: {
          user: id,
          formId,
          candidateId: id,
        },
        submissionSession: {
          connect: { id: events[0].data.submissionSessionId },
        },
      },
    });
    events[0].type = "pageSubmissionevents";
  }
}

export const syncCandidatesEvents = (updateCandidatesEvents, flag, NB_QUERIES, processApiEvent) => {
  Promise.all(
    updateCandidatesEvents
      .slice(flag, flag + NB_QUERIES)
      .map((updateCandidateEvent) => {
        return processApiEvent(
          updateCandidateEvent.candidateEvent,
          updateCandidateEvent.formId,
          updateCandidateEvent.candidateId
        );
      })
  ).then(() => {
    flag += NB_QUERIES;
    if (flag < updateCandidatesEvents.length) {
      setTimeout(() => {
        syncCandidatesEvents(updateCandidatesEvents, flag, NB_QUERIES, processApiEvent);
      }, 1000);
    }
  });
};
