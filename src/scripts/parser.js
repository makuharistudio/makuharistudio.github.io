import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPathPosts = path.join(__dirname, "../markdown/posts");
const dirPathProjects = path.join(__dirname, "../markdown/projects");
const dirPathReadings = path.join(__dirname, "../markdown/readings");

let postlist = [];
let projectlist = [];
let readinglist = [];

const getPosts = async () => {
  try {
    const files = await fs.readdir(dirPathPosts);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathPosts}/${file}`, "utf8");
      const obj = parsePostMarkdown(contents, file);
      if (obj) {
        postlist.push(obj);
      }
    }

    // Sort in descending order by id (timestamp)
    postlist.sort((a, b) => b.id - a.id);

    // Save to posts.json
    await fs.writeFile(path.join(__dirname, "../data/posts.json"), JSON.stringify(postlist, null, 2));
  } catch (err) {
    console.error("Error reading posts directory:", err);
  }
};

const parsePostMarkdown = (contents, filename) => {
  const lines = contents.split(/\r?\n/); // Handles both \n and \r\n
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null;

  const metadata = parseMetadata(lines, metadataIndices);

  // Preserve ALL blank lines (including multiple consecutive ones and leading/trailing)
  const contentLines = lines.slice(metadataIndices[1] + 1);
  const content = contentLines.join("\n");

  const timestamp = new Date(metadata.date).getTime() / 1000;

  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '')
        .replace(/\s+/g, '-')
    : "no-title";

  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp),
    title: metadata.title || "No title given",
    name: name,
    tech: metadata.tech || "No tech given",
    tags: metadata.tags || "No tags given",
    date: metadata.date || "No date given",
    content: content || "",
    photo: photoPath
  };
};

const getProjects = async () => {
  try {
    const files = await fs.readdir(dirPathProjects);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathProjects}/${file}`, "utf8");
      const obj = parseProjectMarkdown(contents, file);
      if (obj) {
        projectlist.push(obj);
      }
    }

    projectlist.sort((a, b) => b.id - a.id);

    await fs.writeFile(path.join(__dirname, "../data/projects.json"), JSON.stringify(projectlist, null, 2));
  } catch (err) {
    console.error("Error reading projects directory:", err);
  }
};

const parseProjectMarkdown = (contents, filename) => {
  const lines = contents.split(/\r?\n/);
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null;

  const metadata = parseMetadata(lines, metadataIndices);

  const contentLines = lines.slice(metadataIndices[1] + 1);
  const content = contentLines.join("\n");

  const timestamp = new Date(metadata.date).getTime() / 1000;

  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '')
        .replace(/\s+/g, '-')
    : "no-title";

  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp),
    title: metadata.title || "No title given",
    name: name,
    tech: metadata.tech || "No tech given",
    tags: metadata.tags || "No tags given",
    date: metadata.date || "No date given",
    content: content || "",
    desc: metadata.description || "No description given",
    photo: photoPath,
    siteURL: metadata.siteURL || "No site URL given",
    codeURL: metadata.codeURL || "No code URL given"
  };
};

const getReadings = async () => {
  try {
    const files = await fs.readdir(dirPathReadings);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathReadings}/${file}`, "utf8");
      const obj = parseReadingMarkdown(contents, file);
      if (obj) {
        readinglist.push(obj);
      }
    }

    readinglist.sort((a, b) => b.id - a.id);

    await fs.writeFile(path.join(__dirname, "../data/readings.json"), JSON.stringify(readinglist, null, 2));
  } catch (err) {
    console.error("Error reading readings directory:", err);
  }
};

const parseReadingMarkdown = (contents, filename) => {
  const lines = contents.split(/\r?\n/);
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null;

  const metadata = parseMetadata(lines, metadataIndices);

  const contentLines = lines.slice(metadataIndices[1] + 1);
  const content = contentLines.join("\n");

  const timestamp = new Date(metadata.date).getTime() / 1000;

  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '')
        .replace(/\s+/g, '-')
    : "no-title";

  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp),
    title: metadata.title || "No title given",
    name: name,
    author: metadata.author || "No author given",
    publisher: metadata.publisher || "No publisher given",
    publisherURL: metadata.publisherURL || "No URL given",
    photo: photoPath,
    category: metadata.category || "No category given",
    date: metadata.date || "No date given",
    desc: metadata.description || "No description given",
    tags: metadata.tags || "No tags given",
    content: content || ""
  };
};

// Shared helper functions

const getMetadataIndices = (lines) => {
  return lines.reduce((acc, line, i) => {
    if (/^---/.test(line.trim())) { // .trim() to be safe with possible spaces
      acc.push(i);
    }
    return acc;
  }, []);
};

const parseMetadata = (lines, metadataIndices) => {
  const metadata = {};
  const metaLines = lines.slice(metadataIndices[0] + 1, metadataIndices[1]);
  metaLines.forEach(line => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      metadata[key] = value;
    }
  });
  return metadata;
};

// Run all parsers
getPosts();
getProjects();
getReadings();