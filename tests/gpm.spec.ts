import { test } from "@playwright/test";
import { extractAvailableDays, fillEndDate, fillStartDate, proceed, selectAnyArea, switchToArea } from "../helpers";
import { sendReport, startNotification } from "../reports";
import { AreaResult, mergeResults, numOfDaysAvailable, splitIntoNumAndLocation, text, toString } from "../utils";

test("basic test", async ({ page }) => {
  test.setTimeout(300000);

  const checkAll = async () => {
    const june = await checkAllAreas(new Date(), new Date("06-30-2022"));
    const july = await checkAllAreas(new Date("07-01-2022"), new Date("07-31-2022"));
    const august = await checkAllAreas(new Date("08-01-2022"), new Date("08-31-2022"));
    const september = await checkAllAreas(new Date("09-01-2022"), new Date("09-30-2022"));
    const october = await checkAllAreas(new Date("10-01-2022"), new Date("10-31-2022"));

    return mergeResults([june, july, august, september, october]);
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
  await startNotification();
  const results = await checkAll();
  await sendReport(results);
});
