import { Page } from "https://raw.githubusercontent.com/lucacasonato/deno-puppeteer/main/mod.ts";
import { assertNotEquals } from "/deps.ts";
import { browserTest, btnSelector, textInputSelector } from "./_utils.ts";

export const loginAnonymous = async (page: Page, userName: string) => {
  await page.waitForSelector(".Screen");
  await page.type(textInputSelector("given-name"), userName);
  await page.click(btnSelector("login-anonymous"));
  assertNotEquals(await page.$(btnSelector("logout")), null);
};

browserTest("Login - Anonymous", async (page: Page, emulatedName?: string) => {
  await page.screenshot({
    path: `screenshots/login_page_${emulatedName ?? "desktop"}.jpeg`,
  });
  await loginAnonymous(page, "Luke");
});
