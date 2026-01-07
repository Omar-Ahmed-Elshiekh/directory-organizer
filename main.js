#!/usr/bin/env node
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

run(args);

function run(args) {
  const folderToFileMap = {
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

  const targetDir = args.find((arg) => !arg.startsWith("-")) || process.cwd();
  const dryRun = args.includes("--dry-run") || args.includes("-d");

  const folders = [];
  const files = [];

  makeFolders(folderToFileMap, targetDir, dryRun);
  mapDirectoryContentTypes(targetDir, files, folders);

  for (const file of files) {
    try {
      const targetFolder =
        getTargetFolder(file.name, folderToFileMap) ?? "others";
      const fullDestinationPath = path.join(targetDir, targetFolder);
      const safeFilePath = getSafeFilePath(fullDestinationPath, file.name);

      if (!dryRun) {
        fs.renameSync(path.join(targetDir, file.name), safeFilePath);
        console.log(`Moved: ${file.name} -> ${targetFolder}`);
      } else {
        console.log(`Would move: ${file.name} -> ${targetFolder}`);
      }
    } catch (err) {
      console.error(`Failed to move ${file.name}:`, err.message);
    }
  }
}

function makeFolders(obj, baseDir, dryRun = false) {
  if (dryRun) return;
  for (const key in obj) {
    const dirPath = path.join(baseDir, key);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      obj[key] !== null
    ) {
      makeFolders(obj[key], dirPath);
    }
  }
}

function mapDirectoryContentTypes(dir, files, folders) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    entry.isFile() ? files.push(entry) : folders.push(entry);
  });
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

function getSafeFilePath(dir, filename) {
  const fileInfo = path.parse(filename);
  let name = fileInfo.name;
  let ext = fileInfo.ext;

  let counter = 1;
  let finalFilePath = path.join(dir, filename);

  while (fs.existsSync(finalFilePath)) {
    const match = name.match(/^(.+) \((\d+)\)$/);
    if (match) {
      name = match[1];
      counter = parseInt(match[2]) + 1;
    }

    finalFilePath = path.join(dir, `${name} (${counter})${ext}`);
    counter++;
  }

  return finalFilePath;
}
