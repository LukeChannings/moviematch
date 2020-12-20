import { getConfig } from "/internal/app/moviematch/config.ts";
import { setupLogger } from "/internal/app/moviematch/logger.ts";

const config = getConfig();

await setupLogger(config.logLevel);
