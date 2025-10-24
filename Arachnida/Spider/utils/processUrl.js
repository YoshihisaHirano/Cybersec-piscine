import { parseDocument } from "./parseDocument.js";
import { saveImages } from "./saveImages.js";

export async function processUrl({ urlString, recursionLevel, path }) {
  const res = await fetch(urlString);
  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.statusText}`);
  }
  const text = await res.text();
  const { images, links } = parseDocument({
    html: text,
    isRecursive: Boolean(recursionLevel),
  });
  const allImages = new Set([...images]);
  const allLinks = new Set([...links]);
  const linksByLevel = new Map([[0, [...links]]]);
  for (let i = 0; i < recursionLevel; i++) {
    for (const link of linksByLevel.get(i) || []) {
      try {
        const url = new URL(link, urlString);
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Failed to fetch URL: ${url}, ${res.statusText}`);
          continue;
        }
        const text = await res.text();
        const { images, links } = parseDocument({
          html: text,
          isRecursive: true
        });
        for (const img of images) {
          allImages.add(img);
        }
        const resultingLinks = [];
        for (const l of links) {
          if (!allLinks.has(l)) {
            allLinks.add(l);
            resultingLinks.push(l);
          }
        }
        linksByLevel.set(i + 1, [...linksByLevel.get(i + 1) || [], ...resultingLinks]);
      } catch (error) {
        console.warn(`Error fetching URL: ${link}, ${error?.message}`);
      }
    }
  }
  await saveImages({
    path,
    images: allImages,
    baseUrl: urlString,
  });
}
