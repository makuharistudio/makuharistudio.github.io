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
    console.log(files);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathPosts}/${file}`, "utf8");
      const obj = parsePostMarkdown(contents, file); // Pass the filename
      if (obj) {
        postlist.push(obj);
      }
    }

    // Sort postlist in descending order by id (timestamp)
    postlist.sort((a, b) => b.id - a.id);

    // Save posts to posts.json
    await fs.writeFile(path.join(__dirname, "../data/posts.json"), JSON.stringify(postlist, null, 2));
  } catch (err) {
    console.error("Error reading posts directory:", err);
  }
};

const parsePostMarkdown = (contents, filename) => {
  const lines = contents.split("\n");
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null; // No metadata found

  const metadata = parseMetadata(lines, metadataIndices);
  const content = lines.slice(metadataIndices[1] + 1).join("\n").trim();

  // Convert the date to a timestamp format without dashes
  const timestamp = new Date(metadata.date).getTime() / 1000;

  // Generate the name field used for URL
  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '') // Remove special characters except dashes and spaces
        .replace(/\s+/g, '-') // Replace spaces with dashes
    : "no-title";

  // Directly use the photo URL as it is (either local or external)
  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp), // Use the timestamp as the ID
    title: metadata.title || "No title given",
    name: name,
    tech: metadata.tech || "No tech given",
    tags: metadata.tags || "No tags given",
    date: metadata.date || "No date given",
    content: content || "No content given",
    photo: photoPath
  };
};

const getProjects = async () => {
  try {
    const files = await fs.readdir(dirPathProjects);
    console.log(files);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathProjects}/${file}`, "utf8");
      const obj = parseProjectMarkdown(contents, file); // Pass the filename
      if (obj) {
        projectlist.push(obj);
      }
    }

    // Sort projectlist in descending order by id (timestamp)
    projectlist.sort((a, b) => b.id - a.id);

    // Save projects to projects.json
    await fs.writeFile(path.join(__dirname, "../data/projects.json"), JSON.stringify(projectlist, null, 2));
  } catch (err) {
    console.error("Error reading projects directory:", err);
  }
};

const parseProjectMarkdown = (contents, filename) => {
  const lines = contents.split("\n");
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null; // No metadata found

  const metadata = parseMetadata(lines, metadataIndices);
  const content = lines.slice(metadataIndices[1] + 1).join("\n").trim();

  // Convert the date to a timestamp format without dashes
  const timestamp = new Date(metadata.date).getTime() / 1000;

  // Generate the name field used for URL
  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '') // Remove special characters except dashes and spaces
        .replace(/\s+/g, '-') // Replace spaces with dashes
    : "no-title";

  // Directly use the photo URL as it is (either local or external)
  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp), // Use the timestamp as the ID
    title: metadata.title || "No title given",
    name: name,
    tech: metadata.tech || "No tech given",
    tags: metadata.tags || "No tags given",
    date: metadata.date || "No date given",
    content: content || "No content given",
    desc: metadata.description || "No description given",
    photo: photoPath,
    siteURL: metadata.siteURL || "No site URL given",
    codeURL: metadata.codeURL || "No code URL given"
  };
};

const getReadings = async () => {
  try {
    const files = await fs.readdir(dirPathReadings);
    console.log(files);

    for (const file of files) {
      const contents = await fs.readFile(`${dirPathReadings}/${file}`, "utf8");
      const obj = parseReadingMarkdown(contents, file); // Pass the filename
      if (obj) {
        readinglist.push(obj);
      }
    }

    // Sort readinglist in descending order by id (timestamp)
    readinglist.sort((a, b) => b.id - a.id);

    // Save readings to readings.json
    await fs.writeFile(path.join(__dirname, "../data/readings.json"), JSON.stringify(readinglist, null, 2));
  } catch (err) {
    console.error("Error reading readings directory:", err);
  }
};

const parseReadingMarkdown = (contents, filename) => {
  const lines = contents.split("\n");
  const metadataIndices = getMetadataIndices(lines);
  if (metadataIndices.length < 2) return null; // No metadata found

  const metadata = parseMetadata(lines, metadataIndices);
  const content = lines.slice(metadataIndices[1] + 1).join("\n").trim();

  // Convert the date to a timestamp format without dashes
  const timestamp = new Date(metadata.date).getTime() / 1000;

  // Generate the name field used for URL
  const name = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9- ]/g, '') // Remove special characters except dashes and spaces
        .replace(/\s+/g, '-') // Replace spaces with dashes
    : "no-title";

  // Directly use the photo URL as it is (either local or external)
  const photoPath = metadata.photo ? metadata.photo : '';

  return {
    id: Math.floor(timestamp), // Use the timestamp as the ID
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
    content: content || "No content given"
  };
};

// Shared functions

const getMetadataIndices = (lines) => {
  return lines.reduce((acc, line, i) => {
    if (/^---/.test(line)) {
      acc.push(i);
    }
    return acc;
  }, []);
};

const parseMetadata = (lines, metadataIndices) => {
  const metadata = {};
  const metaLines = lines.slice(metadataIndices[0] + 1, metadataIndices[1]);
  metaLines.forEach(line => {
    const [key, value] = line.split(": ");
    metadata[key] = value;
  });
  return metadata;
};

getPosts();
getProjects();
getReadings();