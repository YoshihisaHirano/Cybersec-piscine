import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "./parseArgs.js";

test("parses -r, -l <n>, -p <dir> and URL", () => {
  const argv = [
    "node",
    "spider.js",
    "-r",
    "-l",
    "3",
    "-p",
    "data",
    "http://example.com/",
  ];
  const res = parseArgs(argv);
  assert.strictEqual(res.recursive, true, "expected recursive to be true");
  assert.strictEqual(res.level, 3, "expected level to be 3");
  assert.strictEqual(res.path, "data", "expected path to be the provided path");
  assert.strictEqual(res.url, "http://example.com/", "expected url href");
});

test("uses default level when -l is invalid", () => {
  const argv = ["node", "spider.js", "-l", "bad", "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(res.level, 5, "expected default level 5 on invalid -l");
});

test("keeps default path when -p value is invalid", () => {
  const argv = ["node", "spider.js", "-p", "file?txt", "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(
    res.path,
    "./data/",
    "expected default path when -p arg is rejected"
  );
});

test("missing URL calls process.exit(1)", () => {
  const originalExit = process.exit;
  try {
    process.exit = (code = 0) => {
      throw new Error(`EXIT:${code}`);
    };
    assert.throws(
      () => parseArgs([]),
      (err) => err.message === "EXIT:1"
    );
  } finally {
    process.exit = originalExit;
  }
});

test("invalid URL calls process.exit(1)", () => {
  const originalExit = process.exit;
  try {
    process.exit = (code = 0) => {
      throw new Error(`EXIT:${code}`);
    };
    const argv = ["node", "spider.js", "-r", "not-a-url"];
    assert.throws(
      () => parseArgs(argv),
      (err) => err.message === "EXIT:1"
    );
  } finally {
    process.exit = originalExit;
  }
});

test("invalid -l does not consume next arg (next can become an option)", () => {
  const argv = ["node", "spider.js", "-l", "-r", "3", "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(res.level, 5, "invalid -l should keep default level");
  assert.strictEqual(
    res.recursive,
    true,
    "-r following invalid -l should be processed"
  );
  assert.strictEqual(res.url, "http://example.com/", "url should be parsed");
});

test("-p followed by another option preserves that option (doesn't consume it)", () => {
  const argv = ["node", "spider.js", "-p", "-r", "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(
    res.path,
    "./data/",
    "invalid/missing -p value keeps default path"
  );
  assert.strictEqual(
    res.recursive,
    true,
    "-r following -p should be processed"
  );
});

test("multiple -l flags: later one overrides earlier one", () => {
  const argv = [
    "node",
    "spider.js",
    "-l",
    "2",
    "-l",
    "4",
    "http://example.com/",
  ];
  const res = parseArgs(argv);
  assert.strictEqual(res.level, 4, "last -l should set the level");
});

test("non-string -p argument (Buffer) treated as invalid and keeps default path", () => {
  const buf = Buffer.from("data");
  const argv = ["node", "spider.js", "-p", buf, "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(
    res.path,
    "./data/",
    "non-string -p value should be rejected"
  );
  assert.strictEqual(res.url, "http://example.com/");
});

test("-p followed by URL (no explicit path) results in default path", () => {
  const argv = ["node", "spider.js", "-p", "http://example.com/"];
  const res = parseArgs(argv);
  assert.strictEqual(
    res.path,
    "./data/",
    "-p followed directly by URL should keep default path"
  );
  assert.strictEqual(res.url, "http://example.com/");
});
