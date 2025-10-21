import path from "path";

export function isValidDirectoryPath(pathString) {
  if (typeof pathString !== "string" || pathString.length === 0) {
    return false;
  }
  try {
    const normalized = path.normalize(pathString);

    path.parse(normalized);
    const allowedPattern = /^[\.\w\s./\\-]+$/;
    return allowedPattern.test(pathString);
  } catch (error) {
    return false;
  }
}
