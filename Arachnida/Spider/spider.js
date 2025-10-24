#!/usr/bin/env node

import { parseArgs } from "./utils/parseArgs.js";
import { processUrl } from "./utils/processUrl.js";

async function main() {
  try {
    const optionsArgs = process.argv.slice(2);
    const options = parseArgs(optionsArgs);
    console.log("Options have been successfully parsed:", options);
    const recursionLevel = options.recursive ? options.level : 0;
    await processUrl({ urlString: options.url, recursionLevel, path: options.path });
  } catch (error) {
    console.error("Error running spider:", error);
    process.exit(1);
  }
}

main();
