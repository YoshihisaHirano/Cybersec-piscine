import { isValidDirectoryPath } from "./isValidPath.js";

const AVAILABLE_OPTIONS = new Set(["-r", "-l", "-p"]);

export function parseArgs(args) {
  const urlArg = args.at(-1).trim();
  if (!urlArg) {
    console.error("No URL provided.");
    process.exit(1);
  }
  let url;
  try {
    url = new URL(urlArg);
  } catch (error) {
    console.error("Invalid URL provided:", urlArg);
    process.exit(1);
  }
  const options = {
    url: url.href,
    path: "./data/",
    level: 5,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i].toString().trim();
    if (arg.startsWith("-")) {
      if (arg.length !== 2 || !AVAILABLE_OPTIONS.has(arg)) {
        console.warn("Invalid option:", arg);
        continue;
      }
      if (arg === "-r") {
        options.recursive = true;
      }
      if (arg === "-l") {
        const levelArg = args[i + 1];
        let level = Number(levelArg);
        if (isNaN(level) || level < 0) {
          console.warn(
            `Invalid level for -l option: ${levelArg}, using default level 5.`
          );
          continue;
        }
        options.level = level;
        i++;
      }
      if (arg === "-p") {
        const pathArg = args[i + 1];
        const isValidPath = pathArg && !AVAILABLE_OPTIONS.has(pathArg) && isValidDirectoryPath(pathArg);
        if (!isValidPath) {
          console.warn(
            `Invalid path provided for -p option: ${pathArg}, using default './data/'.`
          );
          continue;
        }
        options.path = pathArg;
        i++;
      }
    }
  }
  return options;
}
