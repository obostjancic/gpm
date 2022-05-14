import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { Month } from "./gpm";

export type AreaResult = {
  numOfDaysAvailable: number;
  availableDays: Date[];
  location: string;
  areaNumber: string;
};

export const toDate = (dayStr: string) => {
  const parsedDay = parse(dayStr, "dd. LLLL", 0, { locale: de });
  parsedDay.setFullYear(2022);

  return parsedDay;
};

export const splitIntoNumAndLocation = (str: string) => {
  const [areaNumber, location] = str.split("(");
  return { areaNumber: areaNumber.trim(), location: location.trim().replace(")", "") };
};

export const numOfDaysAvailable = (str: string) => {
  const extractedDays = str
    .split("möglich")[0]
    .match(/\d+|\./g)
    .join("");

  if (extractedDays.includes("2022")) return 1;
  return Number(extractedDays);
};

export const text = async promise => promise.then(el => el?.innerText());

export const toString = (date: Date) => format(date, "dd.MM.yyyy", { locale: de });

export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {} as any);
};

export const mergeResults = (results: AreaResult[][]) => {
  const grouped: Record<string, AreaResult[]> = groupBy(results.flat(), "areaNumber");

  return Object.values(grouped).map(
    (areaResults): AreaResult => ({
      areaNumber: areaResults[0].areaNumber,
      location: areaResults[0].location,
      availableDays: areaResults.reduce((acc, curr) => [...acc, ...curr.availableDays], []),
      numOfDaysAvailable: areaResults.reduce((acc, curr) => acc + curr.numOfDaysAvailable, 0),
    })
  );
};

export const datesForMonth = (month: Month) => {
  const intervalMap = {
    june: {
      from: new Date("06-01-2022"),
      to: new Date("06-30-2022"),
    },
    july: {
      from: new Date("07-01-2022"),
      to: new Date("07-31-2022"),
    },
    august: {
      from: new Date("08-01-2022"),
      to: new Date("08-31-2022"),
    },
    september: {
      from: new Date("09-01-2022"),
      to: new Date("09-30-2022"),
    },
    october: {
      from: new Date("10-01-2022"),
      to: new Date("10-31-2022"),
    },
  };

  return intervalMap[month];
};

export const shortDate = (date: Date) => {
  return padLeft(format(new Date(date), "EEE - dd.MMM "), 13);
};

export const firstDays = (dates: Date[]) => {
  return dates.slice(0, 3).map(shortDate);
};

export const shortNum = (areaNum: string) => {
  return areaNum.replace(/^Nummer /, "No. ");
};

export const padLeft = (str: string, length: number = 6, pad: string = " "): string => {
  return str.length >= length ? str : padLeft(pad + str, length, pad);
};

export const padRight = (str: string, length: number = 6, pad: string = " "): string => {
  return str.length >= length ? str : padRight(str + pad, length, pad);
};

export const getFirstAvailableDate = (report: AreaResult[]) => {
  const dates = report.map(area => new Date(area.availableDays?.[0]));
  return dates.sort((a, b) => a.getTime() - b.getTime())[0];
};

export const getFirstAvailableDateText = (report: AreaResult[]) => {
  const dates = report.map(area => new Date(area.availableDays?.[0]));
  if (dates.length) return `First available date: ${shortDate(dates.sort((a, b) => a.getTime() - b.getTime())[0])}`;
  return "No dates available";
};
