import { format } from "date-fns";
import { AreaResult } from "./utils";
import axios from "axios";

const shortDate = (date: Date) => {
  return padLeft(format(new Date(date), "EEE - dd.MMM "), 13);
};

const firstDays = (dates: Date[]) => {
  return dates.slice(0, 3).map(shortDate);
};

const shortNum = (areaNum: string) => {
  return areaNum.replace(/^Nummer /, "No. ");
};

const padLeft = (str: string, length: number = 6, pad: string = " "): string => {
  return str.length >= length ? str : padLeft(pad + str, length, pad);
};

const padRight = (str: string, length: number = 6, pad: string = " "): string => {
  return str.length >= length ? str : padRight(str + pad, length, pad);
};

const getFirstAvailableDay = (report: AreaResult[]) => {
  const dates = report.map(area => new Date(area.availableDays?.[0]));
  if (dates.length) return `First available date: ${shortDate(dates.sort((a, b) => a.getTime() - b.getTime())[0])}`;
  return "No dates available";
};

const formatReport = (report: AreaResult[]) => {
  const rows = report.map(area => {
    return [
      padRight(shortNum(area.areaNumber)),
      padRight(firstDays(area.availableDays).join(" "), 41),
      padLeft(String(area.numOfDaysAvailable), 3),
    ];
  });
  return [
    ["Area  ", padRight("First days", 41), "Total"].join(" | "),
    ["----------------------------------------------------------"],
  ]
    .concat(rows.map(row => row.join(" | ")))
    .join("\n");
};

export const sendReport = async (report: AreaResult[]) => {
  const formattedReport = formatReport(report);

  await axios.post("https://hooks.slack.com/services/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", {
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: getFirstAvailableDay(report),
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Reserve 🔥",
              emoji: true,
            },
            style: "primary",
            url: "https://mein.wien.gv.at/grillplatz/internet/Startseite.aspx",
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Details: \n\`\`\`${formattedReport}\`\`\``,
        },
      },
    ],
  });
};
