#!/usr/bin/env node

import { parseArgs } from "./utils/parseArgs.js";

function main() {
  try {
    const optionsArgs = process.argv.slice(2);
    console.log("Options Arguments:", optionsArgs);
    const options = parseArgs(optionsArgs);
    console.log("Parsed Options:", options);
  } catch (error) {
    console.error("Error running spider:", error);
    process.exit(1);
  }
}

main();
