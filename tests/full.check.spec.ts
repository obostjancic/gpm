import { test } from "@playwright/test";
import { gpm } from "../gpm";

test("full check", async ({ page }) => {
  test.setTimeout(300000);
  console.log("Full check");
  await gpm({
    months: ["june", "july", "august", "september", "october"],
    notificationLevel: "debug",
    page,
  });
});
