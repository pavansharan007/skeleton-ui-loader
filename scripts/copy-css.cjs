const fs = require("node:fs");
const path = require("node:path");

const source = path.resolve(__dirname, "../src/renderer/shimmer.css");
const target = path.resolve(__dirname, "../dist/index.css");

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log("Copied shimmer.css to dist/index.css");
