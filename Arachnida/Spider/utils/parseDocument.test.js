import test from "node:test";
import assert from "node:assert/strict";
import { parseDocument } from "./parseDocument.js";

test("parseDocument returns Sets and finds images from img/srcset/source", () => {
  const html = `
    <img src="http://example.com/a.jpg" />
    <img src="b.png" />
    <img srcset="c.jpeg 1x, d.gif 2x" />
    <source srcset="e.bmp, f.jpg 2x" />
  `;
  const { images, links } = parseDocument({ html, isRecursive: false });

  assert(images instanceof Set, "images should be a Set");
  assert(links instanceof Set, "links should be a Set");

  const actualImages = Array.from(images).sort();
  const expectedImages = [
    "http://example.com/a.jpg",
    "b.png",
    "c.jpeg",
    "d.gif",
    "e.bmp",
    "f.jpg",
  ].sort();
  assert.deepStrictEqual(actualImages, expectedImages);
});

test("parseDocument handles meta/link/video image sources (case-insensitive ext)", () => {
  const html = `
    <meta property="og:image" content="og-image.JPG" />
    <link rel="icon" href="/favicon.png" />
    <video poster="poster.JPG"></video>
  `;
  const { images } = parseDocument({ html, isRecursive: false });

  const actual = Array.from(images).sort();
  const expected = ["/favicon.png", "og-image.JPG", "poster.JPG"].sort();
  assert.deepStrictEqual(actual, expected);
});

test("parseDocument excludes unsupported formats and respects srcset descriptors", () => {
  const html = `
    <img src="vector.svg" />
    <img srcset="good.jpg 1x, bad.svg 2x, another.png 3x" />
  `;
  const { images } = parseDocument({ html, isRecursive: false });

  const actual = Array.from(images).sort();
  const expected = ["good.jpg", "another.png"].sort();
  assert.deepStrictEqual(actual, expected);
});

test("parseDocument collects only allowed anchor hrefs when isRecursive=true", () => {
  const html = `
    <a href="http://allowed.example/">ok</a>
    <a href="#fragment">fragment</a>
    <a href="javascript:alert(1)">js</a>
    <a href="mailto:user@example.com">mail</a>
    <a href="tel:+123">tel</a>
    <a href="data:image/png;base64,AAAA">data</a>
  `;
  const { links } = parseDocument({ html, isRecursive: true });

  const actualLinks = Array.from(links).sort();
  const expectedLinks = ["http://allowed.example/"].sort();
  assert.deepStrictEqual(actualLinks, expectedLinks);
});

test("parseDocument strips fragments from image URLs, leaves query params", () => {
  const html = `
    <img src="photo.jpg?size=200#zoom" />
    <img srcset="a.png?x=1 1x, b.gif#frag 2x" />
  `;
  const { images } = parseDocument({ html, isRecursive: false });

  const actual = Array.from(images).sort();
  const expected = ["photo.jpg?size=200", "a.png?x=1", "b.gif"].sort();
  assert.deepStrictEqual(actual, expected);
});
