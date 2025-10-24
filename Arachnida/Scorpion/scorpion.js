#!/usr/bin/env node

import { exiftool } from "exiftool-vendored";

const IMAGE_FORMATS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp"]);

function formatTagValue(val) {
  if (val === undefined || val === null) return undefined;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object") {
    if (val && typeof val.rawValue === "string") {
      return val.rawValue.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    }
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function prettyPrintTags(filename, tags) {
  const interesting = [
    "FileName",
    "FileSize",
    "ImageWidth",
    "ImageHeight",
    "Make",
    "Model",
    "LensModel",
    "DateTimeOriginal",
    "CreateDate",
    "ModifyDate",
    "Orientation",
    "GPSLatitude",
    "GPSLongitude",
    "GPSAltitude",
  ];

  const rows = [];
  for (const k of interesting) {
    if (tags[k] !== undefined)
      rows.push({ Tag: k, Value: formatTagValue(tags[k]) });
  }

  if (
    tags.GPSLatitude &&
    tags.GPSLongitude &&
    !rows.find((r) => r.Tag === "GPSLatitude")
  ) {
    rows.push({ Tag: "GPSLatitude", Value: formatTagValue(tags.GPSLatitude) });
    rows.push({
      Tag: "GPSLongitude",
      Value: formatTagValue(tags.GPSLongitude),
    });
  }

  console.log("\n=== " + filename + " ===");
  if (rows.length === 0) {
    console.log("  (no EXIF / no interesting tags found)");
    return;
  }
  const tableObj = Object.fromEntries(rows.map((r) => [r.Tag, r.Value]));
  console.table(tableObj);
}

async function main() {
  const imagePaths = process.argv.slice(2).filter((arg) => {
    const lower = arg.toLowerCase();
    return Array.from(IMAGE_FORMATS).some((ext) => lower.endsWith(ext));
  });

  if (imagePaths.length === 0) {
    console.error(
      "No image files provided. Please provide image file paths as arguments."
    );
    process.exit(1);
  }

  for (const imagePath of imagePaths) {
    try {
      const tags = await exiftool.read(imagePath);
      prettyPrintTags(imagePath, tags);
    } catch (error) {
      console.error(`Error reading EXIF data from ${imagePath}:`, error);
    }
  }

  await exiftool.end();
}

main();
