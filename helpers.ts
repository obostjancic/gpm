import { ElementHandle, Page } from "@playwright/test";
import { toDate, toString } from "./utils";

export const selectAnyArea = async (page: Page) => {
  const anyArea = await page.$("#btngroupBottom_cmdIrgendeinGrillplatz_input");
  await anyArea.click();
  await page.waitForLoadState("networkidle");
};

export const fillStartDate = async (page: Page, targetDate: Date) => {
  const startDateElement = await page.$("#Groupofcontrols1_txtDatumVon_input");
  await fillDate(startDateElement, targetDate);
};

export const fillEndDate = async (page: Page, targetDate: Date) => {
  const endDateElement = await page.$("#Groupofcontrols1_txtDatumBis_input");
  await fillDate(endDateElement, targetDate);
};

export const fillDate = async (dateElement: ElementHandle, targetDate: Date) => {
  await dateElement.scrollIntoViewIfNeeded();
  await dateElement.click();
  await dateElement.fill("");
  await dateElement.type(toString(targetDate));
  await dateElement.press("Enter", { delay: 100 });
};

export const proceed = async (page: Page) => {
  const weiter = await page.$("#grp1_cmdWeiter_input");
  await weiter.click();
  await page.waitForLoadState("networkidle");
};

export const switchToArea = async (page: Page, index: number) => {
  await page.waitForLoadState("networkidle");

  const dropdown = await page.$("#GroupGrillplatz_cboGrillplatz_input");
  await dropdown.scrollIntoViewIfNeeded();
  await dropdown.click();
  await dropdown.selectOption({ index });

  const confirm = await page.$("#GroupGrillplatz_cmdGrillplatz_input");
  await confirm.click();

  await page.waitForLoadState("networkidle");
};

export const extractAvailableDays = async (page: Page) => {
  const calenderTable = await page.$("#GroupKalender_calH");
  const availableDays = await calenderTable.$$("tbody > tr > td > a[style*='color:Black']");

  const availableDaysStr = await Promise.all(availableDays.map(async day => toDate(await day.getAttribute("title"))));

  return availableDaysStr;
};
