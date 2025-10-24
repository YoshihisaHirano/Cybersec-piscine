import { mkdir, writeFile } from "fs/promises";

function normalizeImageUrl(url, baseUrl) {
  try {
    const u = new URL(url, baseUrl);
    u.hash = "";
    return u.href;
  } catch {
    return token.replace(/#.*$/, "");
  }
}

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const filename = url.split("/").pop().split("?")[0];
    return { filename, buffer };
  } catch (error) {
    console.error("Error downloading image: ", url, error?.message);
    return { filename: null, buffer: null };
  }
}

async function saveImageToFile(path, filename, buffer) {
  if (!filename || !buffer) {
    return;
  }
  const fullPath = `${path}/${filename}`;
  await writeFile(fullPath, Buffer.from(buffer));
}

export async function saveImages({ path, images, baseUrl }) {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    throw error("The provided path is an existing file:", path);
  }
  await Promise.all(
    Array.from(images).map(async (imgUrl) => {
      const normalizedUrl = normalizeImageUrl(imgUrl, baseUrl);
      const { filename, buffer } = await downloadImage(normalizedUrl);
      await saveImageToFile(path, filename, buffer);
    })
  );
}
