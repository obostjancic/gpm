import { Page } from "@playwright/test";
import { extractAvailableDays, fillEndDate, fillStartDate, proceed, selectAnyArea, switchToArea } from "./helpers";
import { sendReport } from "./reports";
import {
  AreaResult,
  datesForMonth,
  mergeResults,
  numOfDaysAvailable,
  splitIntoNumAndLocation,
  text,
  toString,
} from "./utils";

export type Month = "june" | "july" | "august" | "september" | "october";
export type NotificationLevel = "debug" | "info";
export type GPMConfig = {
  months: Month[];
  notificationLevel: NotificationLevel;
  page: Page;
};

export const gpm = async ({ months, notificationLevel, page }: GPMConfig) => {
  const checkAll = async () => {
    const results = [];

    for (const month of months) {
      const { from, to } = datesForMonth(month);
      const areaResults = await checkAllAreas(from, to);
      results.push(areaResults);
    }

    return mergeResults(results);
  };

  const checkAllAreas = async (from: Date, to: Date) => {
    console.log("Checking areas for interval", toString(from), "-", toString(to));
    await page.goto("https://mein.wien.gv.at/grillplatz/internet/Startseite.aspx", { waitUntil: "networkidle" });

    await selectAnyArea(page);
    await fillStartDate(page, from);
    await fillEndDate(page, to);
    await proceed(page);

    return collectAreaResults();
  };

  const collectAreaResults = async () => {
    const areaOpts = await page.$$("#GroupGrillplatz_cboGrillplatz_input > option");
    console.log(`Found ${areaOpts.length} areas`);

    const results: AreaResult[] = [];
    for (const areaOptIdx of areaOpts.map((_, i) => i)) {
      console.log(`Checking areas ${areaOptIdx + 1}/${areaOpts.length}`);
      await switchToArea(page, areaOptIdx);
      results.push(await checkArea());
    }
    return results;
  };

  const checkArea = async (): Promise<AreaResult> => {
    const selectedArea = await text(page.$("#GroupGrillplatz_cboGrillplatz_input > option[selected='selected']"));
    const areaSummary = await text(page.$("#GroupKalender_lblH"));

    const availableDaysStr = await extractAvailableDays(page);

    return {
      ...splitIntoNumAndLocation(selectedArea),
      numOfDaysAvailable: numOfDaysAvailable(areaSummary),
      availableDays: availableDaysStr,
    };
  };

  const results = await checkAll();
  await sendReport(results, notificationLevel);
};
