#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

await run(args);

async function run(args) {
  const defaultFolderToFileMap = {
    images: [".jpg", ".jpeg", ".png", ".webp", ".psd", ".svg", ".gif"],
    videos: [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".webm"],
    audios: [".mp3", ".wav"],
    documents: {
      pdfs: [".pdf"],
      docs: [".doc", ".docx", ".odt"],
      sheets: [".csv", ".xlsx", ".ods"],
      powerpoints: [".ppt", ".pptx"],
    },
    apps: [".exe", ".msi", ".deb", ".rpm"],
    texts: [".txt", ".md", ".json", ".xml", ".yaml", ".yml", ".log"],
    compressed: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    fonts: [".ttf", ".otf", ".woff", ".woff2"],
    others: [], //maybe add some structure to others folder too
  };

  const folderToFileMap = await loadConfig(defaultFolderToFileMap);
  const targetDir = args.find((arg) => !arg.startsWith("-")) || process.cwd();
  const dryRun = args.includes("--dry-run") || args.includes("-d");

  await makeFolders(folderToFileMap, targetDir, dryRun);

  //optional feature: add folders organizing options
  const { files, folders } = await mapDirectoryContentTypes(targetDir);

  for (const file of files) {
    try {
      const targetFolder = getTargetFolder(file.name, folderToFileMap) ?? "others";
      const fullDestinationPath = path.join(targetDir, targetFolder);
      const safeFilePath = await getSafeFilePath(fullDestinationPath, file.name);

      if (!dryRun) {
        await fs.rename(path.join(targetDir, file.name), safeFilePath);
        console.log(`Moved: ${file.name} -> ${targetFolder}`);
      } else {
        console.log(`Would move: ${file.name} -> ${targetFolder}`);
      }
    } catch (err) {
      console.error(`Failed to move ${file.name}:`, err.message);
    }
  }
}

async function loadConfig(defaultConfig) {
  const configPath = path.join(__dirname, "organizer-config.json");

  try {
    const configFile = await fs.readFile(configPath, "utf-8");
    const customConfig = JSON.parse(configFile);
    return customConfig;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Using default configuration (no organizer-config.json found)");
      return defaultConfig;
    } else if (err instanceof SyntaxError) {
      console.error("Error parsing organizer-config.json");
      console.error("  Invalid JSON:", err.message);
    } else {
      console.error("Error reading config file");
    }

    const shouldContinue = await promptUser(
      "Do you want to continue with the default configuration? (y/n): "
    );

    if (shouldContinue) {
      console.log("Continuing with default configuration");
      return defaultConfig;
    } else {
      console.log("Exiting program");
      process.exit(0);
    }
  }
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

async function makeFolders(obj, baseDir, dryRun = false) {
  if (dryRun) return;
  for (const key in obj) {
    const dirPath = path.join(baseDir, key);

    try {
      await fs.mkdir(dirPath);
    } catch {
      continue;
    }

    if (typeof obj[key] === "object" && !Array.isArray(obj[key]) && obj[key] !== null) {
      await makeFolders(obj[key], dirPath);
    }
  }
}

async function mapDirectoryContentTypes(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = [];
  const folders = [];

  entries.forEach((entry) => {
    entry.isFile() ? files.push(entry) : folders.push(entry);
  });

  return { files, folders };
}

function getTargetFolder(filename, map) {
  const fileExtension = path.extname(filename).toLowerCase();

  for (const [folder, extensions] of Object.entries(map)) {
    if (Array.isArray(extensions) && extensions.includes(fileExtension)) {
      return folder;
    }

    if (typeof extensions === "object" && extensions !== null) {
      const result = getTargetFolder(filename, extensions);
      if (result) return path.join(folder, result);
    }
  }

  return null;
}

async function getSafeFilePath(dir, filename) {
  const { name, ext } = path.parse(filename);

  let baseName = name;
  let counter = 1;
  let finalFilePath = path.join(dir, filename);

  const match = name.match(/^(.+) \((\d+)\)$/);
  if (match) {
    baseName = match[1];
    counter = parseInt(match[2]) + 1;
  }

  while (true) {
    try {
      await fs.access(finalFilePath);
      finalFilePath = path.join(dir, `${baseName} (${counter})${ext}`);
      counter++;
    } catch {
      return finalFilePath;
    }
  }
}
