const path = require("path");
const fs = require("fs");

const dirPath = path.join(__dirname, "../posts");
const dirPathPages = path.join(__dirname, "../pages");

let postlist = [];
let pagelist = [];

const getPosts = async () => {
    try {
        const files = await fs.promises.readdir(dirPath);
        console.log(files);

        for (const file of files) {
            const contents = await fs.promises.readFile(`${dirPath}/${file}`, "utf8");
            const obj = parseMarkdown(contents, file); // Pass the filename
            if (obj) {
                postlist.push(obj);
            }
        }

        // Sort postlist in descending order by id (timestamp)
        postlist.sort((a, b) => b.id - a.id);

        // Save posts to posts.json
        await fs.promises.writeFile(path.join(__dirname, "../data/posts.json"), JSON.stringify(postlist, null, 2));
    } catch (err) {
        console.error("Error reading posts directory:", err);
    }
};

// Update parseMarkdown to accept filename for unique ID
const parseMarkdown = (contents, filename) => {
    const lines = contents.split("\n");
    const metadataIndices = getMetadataIndices(lines);
    if (metadataIndices.length < 2) return null; // No metadata found

    const metadata = parseMetadata(lines, metadataIndices);
    const content = lines.slice(metadataIndices[1] + 1).join("\n").trim();

    // Convert the date to a timestamp format without dashes
    const timestamp = new Date(metadata.date).getTime() / 1000;

    return {
        id: Math.floor(timestamp), // Use the timestamp as the ID
        title: metadata.title || "No title given",
        tech: metadata.tech || "No tech given",
        tags: metadata.tags || "No tags given",
        date: metadata.date || "No date given",
        content: content || "No content given",
    };
};

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
