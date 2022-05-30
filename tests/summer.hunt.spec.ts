import { test } from "@playwright/test";
import { gpm } from "../gpm";

test("summer hunt", async ({ page }) => {
  console.log("Summer hunt");
  test.setTimeout(300000);

  await gpm({
    months: ["june", "july", "august"],
    notificationLevel: "info",
    page,
  });
});
