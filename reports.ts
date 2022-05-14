import {
  AreaResult,
  firstDays,
  getFirstAvailableDate,
  getFirstAvailableDateText,
  padLeft,
  padRight,
  shortNum,
  shoe,
  shortDate,
} from "./utils";
import axios from "axios";
import { NotificationLevel } from "./gpm";

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

const slackMessageBody = (formattedReport: string) => {
  return {
    blocks: [
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
  };
};

const getHook = () => {
  return process.env.SLACK_WEBHOOK_URL;
};

export const sendReport = async (report: AreaResult[], notificationLevel: NotificationLevel) => {
  if (notificationLevel === "info") {
    const availableDate = getFirstAvailableDate(report);
    if (availableDate) {
      await axios.post(getHook(), {
        text: `DATE FOUND!!! ${shortDate(availableDate)}`,
      });
    }
  }
  if (notificationLevel === "debug") {
    await axios.post(getHook(), {
      text: getFirstAvailableDateText(report),
    });
    await axios.post(getHook(), slackMessageBody(formatReport(report)));
  }
};
