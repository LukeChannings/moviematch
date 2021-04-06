import puppeteer, {
  devicesMap,
  Page,
  TimeoutError,
} from "https://raw.githubusercontent.com/lucacasonato/deno-puppeteer/main/mod.ts";

const MOVIEMATCH_URL = Deno.env.get("MOVIEMATCH_URL") ??
  "http://localhost:8080";

const runPuppeteerTest = async (
  test: (page: Page, emulatedName?: string) => Promise<void>,
  timeoutMs: number,
  emulate?: string,
) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  if (emulate) {
    await page.emulate(devicesMap[emulate]);
  }

  page.on("console", (msg) => {
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`[UI] ${i}: ${msg.args()[i]}`);
    }
  });

  page.on("pageerror", (err: Error) => {
    console.error(`[UI] [Page Error] ${err}`);
  });

  page.on("metrics", (metric: { title: string; metrics: unknown }) => {
    console.log(
      `[UI] [Metrics] ${metric.title} ${JSON.stringify(metric.metrics)}`,
    );
  });

  await page.goto(MOVIEMATCH_URL);

  try {
    await Promise.race([
      test(page, emulate),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new TimeoutError(
                `Test run took longer than ${timeoutMs / 1000} seconds`,
              ),
            ),
          timeoutMs,
        )
      ),
    ]);
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
};

export const browserTest = (
  name: string,
  test: (page: Page, emulatedName?: string) => Promise<void>,
  timeoutMs = 25_000,
) => {
  Deno.test({
    name: `${name} (Desktop)`,
    fn: () => runPuppeteerTest(test, timeoutMs),
    sanitizeOps: false,
  });
  Deno.test({
    name: `${name} (iPhone 6)`,
    fn: () => runPuppeteerTest(test, timeoutMs, "iPhone 6"),
    sanitizeOps: false,
  });

  Deno.test({
    name: `${name} (iPad)`,
    fn: () => runPuppeteerTest(test, timeoutMs, "iPad"),
    sanitizeOps: false,
  });
};

export const textInputSelector = (name: string) =>
  `[data-test-handle="${name}-text-input"]`;
export const selectInputSelector = (name: string) =>
  `[data-test-handle="${name}-select-input"]`;

export const autosuggestInputSelector = (name: string) =>
  `[data-test-handle="${name}-autosuggest-input"]`;

export const autosuggestValueSelector = (name: string, value: string) =>
  `[data-test-handle="${name}-suggestion-${value}"]`;

export const btnSelector = (name: string) =>
  `[data-test-handle="${name}-button"]`;
