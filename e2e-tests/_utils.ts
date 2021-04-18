import puppeteer, {
  ConsoleMessage,
  devicesMap,
  HTTPRequest,
  Page,
  TimeoutError,
} from "https://raw.githubusercontent.com/lucacasonato/deno-puppeteer/main/mod.ts";

const MOVIEMATCH_URL = Deno.env.get("MOVIEMATCH_URL") ??
  "http://localhost:8080";

interface RunPuppeteerTestOptions {
  timeoutMs: number;
  emulate?: string;
  errorScreenshotName?: string;
}

const runPuppeteerTest = async (
  test: (page: Page, emulatedName?: string) => Promise<void>,
  { timeoutMs, emulate, errorScreenshotName }: RunPuppeteerTestOptions,
) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  if (emulate) {
    await page.emulate(devicesMap[emulate]);
  }

  page.on("console", (msg: ConsoleMessage) => {
    console.log(
      `\n[UI] ${msg.text()} ${JSON.stringify(msg.stackTrace(), null, 2)}`,
    );
  });

  page.on("pageerror", (err: Error) => {
    console.error(`[UI] [Page Error] ${err}`);
  });

  page.on("metrics", (metric: { title: string; metrics: unknown }) => {
    console.log(
      `\n[UI] [Metrics] ${metric.title} ${JSON.stringify(metric.metrics)}`,
    );
  });

  page.on("requestfailed", (req: HTTPRequest) => {
    console.log(
      `\n[UI] [Request Failed] ${req.url()} ${JSON.stringify(req.failure())}`,
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
    if (errorScreenshotName) {
      await page.screenshot({ path: errorScreenshotName });
    }
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
    fn: () =>
      runPuppeteerTest(test, {
        timeoutMs,
        errorScreenshotName: `screenshots/${name}-desktop-error.jpeg`,
      }),
    sanitizeOps: false,
  });
  Deno.test({
    name: `${name} (iPhone 6)`,
    fn: () =>
      runPuppeteerTest(test, {
        timeoutMs,
        errorScreenshotName: `screenshots/${name}-mobile-error.jpeg`,
        emulate: "iPhone 6",
      }),
    sanitizeOps: false,
  });

  Deno.test({
    name: `${name} (iPad)`,
    fn: () =>
      runPuppeteerTest(test, {
        timeoutMs,
        errorScreenshotName: `screenshots/${name}-tablet-error.jpeg`,
        emulate: "iPad",
      }),
    sanitizeOps: false,
  });
};

export const selector = (name: string) => `[data-test-handle="${name}"]`;

export const textInputSelector = (name: string) =>
  selector(`${name}-text-input`);

export const selectInputSelector = (name: string) =>
  selector(`${name}-select-input`);

export const autosuggestInputSelector = (name: string) =>
  selector(`${name}-autosuggest-input`);

export const autosuggestValueSelector = (name: string, value: string) =>
  selector(`${name}-suggestion-${value}`);

export const btnSelector = (name: string) => selector(`${name}-button`);
