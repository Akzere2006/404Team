const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");

if (!fs.existsSync(dist)) {
  throw new Error("dist directory was not created by Vite build");
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.cpSync(dist, publicDir, { recursive: true });

console.log("Vercel static files prepared in /public");
