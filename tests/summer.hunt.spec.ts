import { test } from "@playwright/test";
import { gpm } from "../gpm";

test("summer hunt", async ({ page }) => {
  console.log("Summer hunt");
  await gpm({
    months: ["june", "july", "august"],
    notificationLevel: "info",
    page,
  });
});
