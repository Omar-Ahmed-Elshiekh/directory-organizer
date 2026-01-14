# Directory Organizer CLI

A simple and safe Node.js CLI tool that organizes files into folders based on their file types.

It automatically creates folders (like `images`, `documents/pdfs`, `videos`, etc.) and moves files into the correct location — with support for nested folders, filename collision handling, and a dry-run mode.

---

## Features

- Organizes files by extension
- Nested folders (e.g. `documents/pdfs`, `documents/docs`)
- Safe filename collision handling (`file (1).txt`)
- Dry-run mode (`--dry-run`)
- Sensible defaults + `others` fallback
- Works on Windows and Linux

---

## Supported File Types

- **Images:** jpg, png, webp, svg, gif, etc.
- **Videos:** mp4, mkv, avi, mov, webm
- **Audio:** mp3, wav
- **Documents:** pdf, docx, xlsx, pptx, odt, ods
- **Text:** txt, md, json, yaml, log
- **Compressed:** zip, rar, 7z, tar, gz
- **Fonts:** ttf, otf, woff
- **Apps:** exe, msi, deb, rpm
- **Others:** everything else

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Omar-Ahmed-Elshiekh/directory-organizer.git
cd directory-organizer
npm install
```

---

## Usage (local)

Run in the current directory:

```bash
node main.js
```

Run in a specific directory:

```bash
node main.js ./Downloads
```

Dry run (no files are moved):

```bash
node main.js ./Downloads --dry-run
```

Short flag:

```bash
node main.js ./Downloads -d
```

---

## Customize Directory Structure (Optional)

You can customize how files are organized by creating an `organizer-config.json` file in the same directory as the script.

### Configuration Format

Map directory names to file extensions:
```json
{
  "images": [".jpg", ".png", ".gif"],
  "videos": [".mp4", ".mov"],
  "code": [".js", ".py", ".java"]
}
```

### Nested Directories

Create subdirectories for better organization:
```json
{
  "documents": {
    "pdfs": [".pdf"],
    "word": [".doc", ".docx"],
    "spreadsheets": [".xlsx", ".csv"]
  },
  "media": {
    "photos": [".jpg", ".png"],
    "videos": [".mp4", ".avi"]
  }
}
```

### Example Configuration
```json
{
  "images": [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  "videos": [".mp4", ".mkv", ".avi", ".mov"],
  "code": {
    "javascript": [".js", ".jsx", ".ts", ".tsx"],
    "python": [".py"],
    "web": [".html", ".css"]
  },
  "others": []
}
```

### Notes

- Extensions must include the dot (e.g., `.jpg` not `jpg`)
- Extensions are case-insensitive
- Files with unmatched extensions go to the `others` folder
- If the config file has errors, you'll be prompted to use the default configuration or exit

---

## Global CLI Usage (`organize`) "Optional"

You can install this tool as a global command so you can run it as `organize`
instead of `node main.js`.

### 1 Ensure `package.json` has a `bin` entry

```json
{
  "bin": {
    "organize": "./main.js"
  }
}
```

### 2 Make the file executable (macOS / Linux)

```bash
chmod +x main.js
```

### 3 Link the command globally

```bash
npm link
```

### 4 Use it anywhere

```bash
organize
organize ./Downloads
organize ./Downloads --dry-run
```

To remove the global command:

```bash
npm unlink
```

---

## Safety Notes (Important)

* Always try `--dry-run` first to see what will happen
* The tool skips common project files like:

  * `main.js`
  * `package.json`
* Files with unknown extensions go into the `others` folder

---

## Development

```bash
node main.js --dry-run
```

Test in a **throwaway directory** before using it on important files.

---

## License

MIT License

---

## Contributions

Pull requests and suggestions are welcome!
Feel free to fork the project and improve it.

---

## Final Tip

This tool is designed to be **simple, predictable, and safe**.
If you’re unsure — use `--dry-run`.
