/* ===== Asset Studio: Vite plugin (dev server lang, hindi kasama sa build) =====
   Endpoints na ginagamit ng /dev/assets page:
     GET  /__assets/folders                         lahat ng folder sa loob ng src/assets/
     GET  /__assets/list?folder=                    inbox, done at mga webp sa isang folder
     GET  /__assets/file?dir=&folder=&name=         mismong file (para sa preview)
     GET  /__assets/usage?folder=&name=             saang code ginagamit ang isang asset
     POST /__assets/upload?name=                    i-save ang upload sa assets-inbox/
     POST /__assets/autocut?name=&mode=&folder=     patakbuhin ang tools/asset-cutter.mjs
     POST /__assets/mkdir?folder=                   gumawa ng bagong folder sa src/assets/
     POST /__assets/move?name=&from=&to=            ilipat ang asset sa ibang folder
     POST /__assets/delete?dir=&folder=&name=       ilipat sa trash (assets-inbox/trash/), hindi binubura
     POST /__assets/restore?name=                   ibalik ang file mula sa trash sa dating lugar
     POST /__assets/empty-trash                     tuluyang burahin ang laman ng trash
   Lahat ng folder ay relative sa src/assets/ at hindi puwedeng lumabas doon. */

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const ASSETS_ROOT = path.join(SRC, "assets");
const INBOX = path.join(ROOT, "assets-inbox");
const DONE = path.join(INBOX, "done");
const TRASH = path.join(INBOX, "trash");
const DEFAULT_FOLDER = "surprise";
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
const UPLOAD_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MODES = new Set(["auto", "color", "ai", "none"]);
const CODE_EXT = new Set([".vue", ".js", ".mjs", ".css"]);
const MAX_UPLOAD = 40 * 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// pangalan lang ng file (walang folder), at larawan lang ang tinatanggap
function safeName(name, allowed = IMAGE_EXT) {
  const base = path.basename(String(name ?? ""));
  if (!base || !allowed.has(path.extname(base).toLowerCase())) throw new HttpError(400, "Maling pangalan ng file");
  return base;
}

// folder sa loob ng src/assets/ lang (hal. "surprise", "templates/birthday")
function assetFolder(folder) {
  const rel = String(folder ?? DEFAULT_FOLDER)
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
  if (!rel || !/^[a-z0-9][a-z0-9/_-]*$/i.test(rel) || rel.split("/").includes("..")) {
    throw new HttpError(400, "Maling folder (letra, numero, - at _ lang)");
  }
  const full = path.resolve(ASSETS_ROOT, rel);
  if (!full.startsWith(ASSETS_ROOT + path.sep)) throw new HttpError(400, "Nasa labas ng src/assets ang folder");
  return { rel, full };
}

// kaparehong pangalan na gagawin ng asset-cutter (para malaman kung may mapapatungan)
const outputName = (file) =>
  `${path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.webp`;

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const sharp = (await import("sharp")).default;
  sharp.cache(false); // huwag i-lock ang mga file (Windows)
  const files = entries.filter((entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase()));
  return Promise.all(
    files.map(async (entry) => {
      const file = path.join(dir, entry.name);
      const stat = await fs.stat(file);
      const meta = await sharp(file)
        .metadata()
        .catch(() => ({}));
      return {
        name: entry.name,
        size: stat.size,
        modified: stat.mtimeMs,
        width: meta.width ?? null,
        height: meta.height ?? null,
        alpha: meta.hasAlpha ?? false,
      };
    }),
  );
}

async function listFolders(dir = ASSETS_ROOT, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const folders = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    const count = (await fs.readdir(full)).filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase())).length;
    folders.push({ folder: rel, count }, ...(await listFolders(full, rel)));
  }
  return folders;
}

// lahat ng code file sa src/ (maliban sa src/assets/), binabasa nang isang beses bawat request
async function readCodeFiles() {
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full !== ASSETS_ROOT) await walk(full);
      } else if (CODE_EXT.has(path.extname(entry.name))) {
        files.push({ file: path.relative(ROOT, full).replace(/\\/g, "/"), text: await fs.readFile(full, "utf8") });
      }
    }
  }
  await walk(SRC);
  return files;
}

// saang code file nababanggit ang pangalan ng asset (may extension o wala, hal. art["padlock"])
function usageIn(codeFiles, name) {
  const stem = path.basename(name, path.extname(name));
  const pattern = new RegExp(`(^|[^a-z0-9-])${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9-]|$)`, "i");
  return codeFiles.filter(({ text }) => pattern.test(text)).map(({ file }) => file);
}

async function findUsage(name) {
  return usageIn(await readCodeFiles(), name);
}

/* Trash: ang pangalan ng file ang nagtatago kung saan ito galing, para maibalik:
   <oras>__<pinanggalingan>__<pangalan>, hal. 1730300000000__surprise~sub__padlock.webp
   pinanggalingan = "inbox", "done", o folder sa src/assets/ (ang "/" ay ginagawang "~") */
const trashName = (origin, name) => `${Date.now()}__${origin.replace(/\//g, "~")}__${name}`;

function parseTrashName(file) {
  const match = /^(\d+)__([a-z0-9~][a-z0-9~_-]*?)__(.+)$/i.exec(file);
  if (!match) return null;
  return { deleted: Number(match[1]), origin: match[2].replace(/~/g, "/"), name: match[3] };
}

function originDir(origin) {
  if (origin === "inbox") return INBOX;
  if (origin === "done") return DONE;
  return assetFolder(origin).full;
}

async function listTrash() {
  return (await listImages(TRASH))
    .map((file) => ({ ...file, ...parseTrashName(file.name), trashName: file.name }))
    .filter((file) => file.origin)
    .sort((a, b) => b.deleted - a.deleted);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_UPLOAD) {
        reject(new HttpError(413, "Masyadong malaki ang file (max 40MB)"));
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function runCutter(name, mode, outDir) {
  const args = [path.join(ROOT, "tools", "asset-cutter.mjs"), "--only", name, "--mode", mode, "--out", outDir];
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd: ROOT, timeout: 10 * 60 * 1000 }, (error, stdout, stderr) => {
      resolve({ ok: !error, output: `${stdout}${stderr}`.trim() });
    });
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

async function handle(req, res, route, params) {
  const get = req.method === "GET";
  const post = req.method === "POST";

  if (get && route === "folders") return sendJson(res, 200, { folders: await listFolders(), default: DEFAULT_FOLDER });

  if (get && route === "list") {
    const { rel, full } = assetFolder(params.get("folder"));
    const [inbox, done, images, trash, codeFiles] = await Promise.all([
      listImages(INBOX),
      listImages(DONE),
      listImages(full),
      listTrash(),
      readCodeFiles(),
    ]);
    // usedIn: para may label sa gallery kung ginagamit ang asset sa code
    const assets = images.map((file) => ({ ...file, usedIn: usageIn(codeFiles, file.name) }));
    return sendJson(res, 200, { folder: rel, inbox, done, assets, trash });
  }

  if (get && route === "file") {
    const dir = params.get("dir");
    const base =
      dir === "inbox" ? INBOX : dir === "done" ? DONE : dir === "trash" ? TRASH : assetFolder(params.get("folder")).full;
    const name = safeName(params.get("name"));
    const data = await fs.readFile(path.join(base, name));
    res.setHeader("Content-Type", MIME[path.extname(name).toLowerCase()]);
    res.setHeader("Cache-Control", "no-store");
    return res.end(data);
  }

  if (get && route === "usage") {
    const name = safeName(params.get("name"));
    return sendJson(res, 200, { usedIn: await findUsage(name) });
  }

  if (post && route === "upload") {
    const name = safeName(params.get("name"), UPLOAD_EXT);
    const data = await readBody(req);
    await fs.mkdir(INBOX, { recursive: true });
    await fs.writeFile(path.join(INBOX, name), data);
    return sendJson(res, 200, { ok: true, name });
  }

  if (post && route === "autocut") {
    const name = safeName(params.get("name"), UPLOAD_EXT);
    const mode = params.get("mode") ?? "auto";
    if (!MODES.has(mode)) throw new HttpError(400, "Maling mode");
    const { rel, full } = assetFolder(params.get("folder"));
    const target = path.join(full, outputName(name));
    if (params.get("overwrite") !== "1" && (await exists(target))) {
      return sendJson(res, 409, { conflict: true, error: `May ${outputName(name)} na sa ${rel}/` });
    }
    return sendJson(res, 200, await runCutter(name, mode, full));
  }

  if (post && route === "mkdir") {
    const { rel, full } = assetFolder(params.get("folder"));
    await fs.mkdir(full, { recursive: true });
    return sendJson(res, 200, { ok: true, folder: rel });
  }

  if (post && route === "move") {
    const name = safeName(params.get("name"));
    const from = assetFolder(params.get("from"));
    const to = assetFolder(params.get("to"));
    if (from.full === to.full) throw new HttpError(400, "Pareho ang folder");
    const target = path.join(to.full, name);
    if (params.get("overwrite") !== "1" && (await exists(target))) {
      return sendJson(res, 409, { conflict: true, error: `May ${name} na sa ${to.rel}/` });
    }
    await fs.mkdir(to.full, { recursive: true });
    await fs.rename(path.join(from.full, name), target);
    return sendJson(res, 200, { ok: true });
  }

  if (post && route === "delete") {
    const name = safeName(params.get("name"));
    const dir = params.get("dir") ?? "inbox";
    const origin = dir === "inbox" || dir === "done" ? dir : assetFolder(params.get("folder")).rel;
    await fs.mkdir(TRASH, { recursive: true });
    await fs.rename(path.join(originDir(origin), name), path.join(TRASH, trashName(origin, name)));
    return sendJson(res, 200, { ok: true });
  }

  if (post && route === "restore") {
    const file = safeName(params.get("name"));
    const info = parseTrashName(file);
    if (!info) throw new HttpError(400, "Hindi galing sa trash ang file");
    const targetDir = originDir(info.origin);
    const target = path.join(targetDir, safeName(info.name));
    if (params.get("overwrite") !== "1" && (await exists(target))) {
      return sendJson(res, 409, { conflict: true, error: `May ${info.name} na ulit sa ${info.origin}/` });
    }
    await fs.mkdir(targetDir, { recursive: true });
    await fs.rename(path.join(TRASH, file), target);
    return sendJson(res, 200, { ok: true, origin: info.origin });
  }

  if (post && route === "empty-trash") {
    await fs.rm(TRASH, { recursive: true, force: true });
    return sendJson(res, 200, { ok: true });
  }

  throw new HttpError(404, "Walang ganitong endpoint");
}

export default function assetStudio() {
  return {
    name: "smilelink-asset-studio",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__assets", async (req, res) => {
        const url = new URL(req.url, "http://localhost");
        try {
          await handle(req, res, url.pathname.replace(/^\/+/, ""), url.searchParams);
        } catch (error) {
          sendJson(res, error.status ?? 500, { error: error.message });
        }
      });
    },
  };
}
