import { Page } from "https://raw.githubusercontent.com/lucacasonato/deno-puppeteer/main/mod.ts";
import {
  autosuggestInputSelector,
  autosuggestValueSelector,
  browserTest,
  btnSelector,
  getScreenshotOptions,
  selectInputSelector,
  selector,
  textInputSelector,
} from "./_utils.ts";
import { loginAnonymous } from "./login_test.ts";

browserTest(
  "Create Room - No filters",
  async (page: Page, emulatedName?: string) => {
    // JoinScreen
    await loginAnonymous(page, "Luke");
    await page.click(btnSelector("create-room"));

    // CreateScreen
    await page.waitForSelector(textInputSelector("roomName"));
    await page.type(textInputSelector("roomName"), "Abc123" + Date.now());
    await page.click(btnSelector("create-room"));

    await page.screenshot(
      getScreenshotOptions(`create_room_nofilters_${emulatedName ??
        "desktop"}`),
    );
  },
);

browserTest(
  "Create Room - With filters",
  async (page: Page, emulatedName?: string) => {
    // JoinScreen
    await loginAnonymous(page, "Luke");
    await page.click(btnSelector("create-room"));

    // CreateScreen
    await page.waitForSelector(textInputSelector("roomName"));
    await page.type(textInputSelector("roomName"), "Filters-" + Date.now());

    await page.waitForSelector(btnSelector("filter-add"));
    await page.click(btnSelector("filter-add"));

    await page.waitForSelector(selector("0-filter-field"));
    await page.waitForSelector(selectInputSelector("key-0"));

    await page.select(selectInputSelector("key-0"), "genre");

    await page.type(autosuggestInputSelector("value-0"), "Comedy");
    await page.waitForSelector(autosuggestValueSelector("value-0", "Comedy"));
    await page.click(autosuggestValueSelector("value-0", "Comedy"));

    await page.screenshot(
      getScreenshotOptions(`create_room_filters_${emulatedName ?? "desktop"}`),
    );

    await page.click(btnSelector("create-room"));
  },
);
