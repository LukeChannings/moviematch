import { Page } from "https://raw.githubusercontent.com/lucacasonato/deno-puppeteer/main/mod.ts";
import { assertNotEquals } from "/deps.ts";
import {
  browserTest,
  btnSelector,
  getScreenshotOptions,
  textInputSelector,
} from "./_utils.ts";

export const loginAnonymous = async (page: Page, userName: string) => {
  await page.waitForSelector(textInputSelector("given-name"));
  await page.type(textInputSelector("given-name"), userName);
  await page.click(btnSelector("login-anonymous"));
  await page.waitForSelector(btnSelector("logout"));
  assertNotEquals(await page.$(btnSelector("logout")), null);
};

browserTest("Login - Anonymous", async (page: Page, emulatedName?: string) => {
  await page.screenshot(
    getScreenshotOptions(`login_page_${emulatedName ?? "desktop"}`),
  );
  await loginAnonymous(page, "Luke");
});
