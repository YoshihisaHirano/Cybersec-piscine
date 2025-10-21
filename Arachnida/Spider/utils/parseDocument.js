import * as htmlparser2 from "htmlparser2";

const IMAGE_FORMATS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp"]);

function checkImageFormat(url) {
  if (!url) {
    return false;
  }
  const lowerUrl = url.toLowerCase();
  const ext = lowerUrl.slice(lowerUrl.lastIndexOf("."));
  return IMAGE_FORMATS.has(ext);
}

function resolveImageUrl(src) {
  let imgUrl = src.trim();
  // account for srcset with a descriptor (e.g., "image.jpg 2x")
  imgUrl = imgUrl.split(/\s+/)[0];
  if (!checkImageFormat(imgUrl)) {
    return null;
  }
  return imgUrl;
}

function resolveLinkHref(href) {
  let linkUrl = href.trim();
  if (
    href.startsWith("#") ||
    href.startsWith("javascript:") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("data:")
  ) {
    return null;
  }
  return linkUrl;
}

export function parseDocument({ html, isRecursive }) {
  const links = new Set();
  const images = new Set();

  const parser = new htmlparser2.Parser({
    onopentag(name, attribs) {
      if (name === "img" && attribs.src) {
        const imgUrl = resolveImageUrl(attribs.src);
        if (!imgUrl) {
          return;
        }
        images.add(imgUrl);
      }
      if ((name === "source" || name === "img") && attribs.srcset) {
        const srcsetUrls = attribs.srcset.split(",").map((s) => s.trim());
        for (const srcsetUrl of srcsetUrls) {
          const imgUrl = resolveImageUrl(srcsetUrl);
          if (!imgUrl) {
            continue;
          }
          images.add(imgUrl);
        }
      }
      if (
        name === "meta" &&
        (attribs.property === "og:image" || attribs.name === "twitter:image") &&
        attribs.content
      ) {
        const imgUrl = resolveImageUrl(attribs.content);
        if (imgUrl) images.add(imgUrl);
      }
      if (
        name === "link" &&
        attribs.rel &&
        attribs.href &&
        /icon|image/i.test(attribs.rel)
      ) {
        const imgUrl = resolveImageUrl(attribs.href);
        if (imgUrl) images.add(imgUrl);
      }
      if (name === "video" && attribs.poster) {
        const imgUrl = resolveImageUrl(attribs.poster);
        if (imgUrl) images.add(imgUrl);
      }
      if (isRecursive && name === "a" && attribs.href) {
        let linkUrl = attribs.href;
        linkUrl = resolveLinkHref(linkUrl);
        if (!linkUrl) {
          return;
        }
        links.add(linkUrl);
      }
    },
  });

  parser.write(html);
  parser.end();
  return { links, images };
}
