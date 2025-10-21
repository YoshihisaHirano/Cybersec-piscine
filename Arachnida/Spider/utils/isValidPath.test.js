import test from "node:test";
import assert from "node:assert/strict";
import { isValidDirectoryPath } from "./isValidPath.js";

test("accepts common directory paths", () => {
  assert.equal(isValidDirectoryPath("data"), true);
  assert.equal(isValidDirectoryPath("./data"), true);
  assert.equal(isValidDirectoryPath("../out"), true);
  assert.equal(isValidDirectoryPath("/tmp/data"), true);
});

test("rejects non-strings and empty", () => {
  assert.equal(isValidDirectoryPath(undefined), false);
  assert.equal(isValidDirectoryPath(null), false);
  assert.equal(isValidDirectoryPath(123), false);
  assert.equal(isValidDirectoryPath(""), false);
});

test("rejects strings with null byte or disallowed chars", () => {
  assert.equal(isValidDirectoryPath("data\0bad"), false);
  assert.equal(isValidDirectoryPath("data*bad"), false);
  assert.equal(isValidDirectoryPath("bad?name"), false);
});

test("allows dot-directories and names with dots when intended", () => {
  assert.equal(isValidDirectoryPath(".git"), true);
  assert.equal(isValidDirectoryPath("my.dir.name"), true);
  assert.equal(isValidDirectoryPath("dir/file.md"), true);
});
