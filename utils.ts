import { format, parse } from "date-fns";
import { de } from "date-fns/locale";

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
