/* ===== SmileLink Asset Cutter =====
   Kinukuha ang mga larawan sa assets-inbox/, tinatanggal ang background, pinuputol ang sobrang
   gilid, pinapalaki (2x), at sine-save bilang transparent na .webp sa src/assets/surprise/.

   Gamit:
     npm run assets                         lahat ng larawan sa assets-inbox/
     npm run assets -- --mode color         flat na background (cream/puti) → color key
     npm run assets -- --mode ai            AI background removal (IS-Net)
     npm run assets -- --only padlock       isang file lang (pangalan na walang extension)
     npm run assets -- --grid ref.png       gumawa ng grid preview para makuha ang crop coordinates
     npm run assets -- --help               lahat ng options

   Per-file settings (optional): assets-inbox/assets.json
     {
       "lock-ref.png": { "mode": "color", "crops": [{ "name": "padlock", "box": [120, 200, 260, 240] }] },
       "flower.png": { "name": "lock-corner-bottom", "mode": "ai", "model": "anime" }
     }
   box = [x, y, lapad, taas] sa pixels ng orihinal na larawan.
   Sa bawat crop puwede ring: "erase": [[x, y, lapad, taas], ...] (buburahin), at sariling
   "mode" / "tol" / "feather" / "holeTol" na papalit sa settings ng file.

   License: sharp (Apache-2.0), onnxruntime-node (MIT), IS-Net/U²-Net models (Apache-2.0). */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// walang file cache: sa Windows, naiiwang naka-lock ang file kaya hindi mailipat sa done/
sharp.cache(false);

const ROOT = path.resolve(import.meta.dirname, "..");
const INBOX = path.join(ROOT, "assets-inbox");
const DONE = path.join(INBOX, "done");
const MODEL_DIR = path.join(import.meta.dirname, ".models");
const CONFIG_FILE = path.join(INBOX, "assets.json");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/* rembg-compatible ONNX models (isang beses lang ida-download, naka-gitignore) */
const MODELS = {
  general: { file: "isnet-general-use.onnx", size: 1024, mean: [0.5, 0.5, 0.5], std: [1, 1, 1] },
  anime: { file: "isnet-anime.onnx", size: 1024, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225] },
  lite: { file: "u2netp.onnx", size: 320, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225] },
};
const modelUrl = (file) => `https://github.com/danielgatis/rembg/releases/download/v0.0.0/${file}`;

const DEFAULTS = {
  mode: "auto", // auto | color | ai | none
  model: "general", // general | anime | lite
  scale: 2, // ilang beses palalakihin (hanggang maxSide)
  upscaleBelow: 1200, // palalakihin lang kung mas maliit dito ang pinakamahabang gilid
  maxSide: 2400, // pinakamalaking lapad/taas ng output
  tol: 12, // color mode: gaano kalapit sa background para maging transparent (0–441)
  feather: 14, // color mode: lapad ng malambot na gilid
  holeTol: 8, // color mode: tolerance para sa "butas" sa loob (0 = huwag galawin ang loob)
  holeMin: 0.004, // color mode: pinakamaliit na butas na tatanggalin (bahagi ng buong larawan)
  pad: 6, // pixels na iiwan sa paligid pagkatapos mag-trim
  quality: 92,
  out: "src/assets/surprise",
};

const HELP = `
SmileLink Asset Cutter

  npm run assets [-- options]

Options:
  --mode <auto|color|ai|none>   paraan ng pagtanggal ng background (default: auto)
                                auto = color kung flat ang background sa gilid, ai kung hindi
  --model <general|anime|lite>  AI model (default: general; lite = maliit at mabilis)
  --scale <n>                   palakihin nang n beses (default: 2)
  --tol <n>                     color mode tolerance (default: 12; taasan kung may natirang background)
  --feather <n>                 color mode na malambot na gilid (default: 14)
  --holeTol <n>                 tanggalin din ang background sa loob, hal. loob ng bow loop (default: 8; 0 = off)
  --out <folder>                saan ise-save (default: src/assets/surprise)
  --only <name>                 isang file lang (pangalan na walang extension)
  --keep                        huwag ilipat sa assets-inbox/done/ pagkatapos
  --grid <file>                 gumawa ng <file>.grid.png na may coordinates (para sa crops)
`;

/* ===== CLI ===== */
function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (key === "help" || key === "keep") {
      options[key] = true;
    } else {
      options[key] = argv[++i];
    }
  }
  for (const key of ["scale", "upscaleBelow", "tol", "feather", "holeTol", "holeMin", "maxSide", "pad", "quality"]) {
    if (options[key] !== undefined) options[key] = Number(options[key]);
  }
  return options;
}

const toName = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

// rename; kung naka-lock pa sa Windows (EBUSY/EPERM), kopyahin na lang tapos burahin
async function moveFile(from, to) {
  try {
    await fs.rename(from, to);
  } catch (error) {
    if (!["EBUSY", "EPERM", "EXDEV"].includes(error.code)) throw error;
    await fs.copyFile(from, to);
    await fs.rm(from, { force: true, maxRetries: 5, retryDelay: 200 });
  }
}

/* ===== AI model ===== */
async function ensureModel(model) {
  const target = path.join(MODEL_DIR, model.file);
  if (await exists(target)) return target;
  await fs.mkdir(MODEL_DIR, { recursive: true });
  console.log(`⬇  Dina-download ang AI model ${model.file} (isang beses lang)...`);
  const response = await fetch(modelUrl(model.file));
  if (!response.ok) throw new Error(`Hindi ma-download ang model (HTTP ${response.status})`);
  const total = Number(response.headers.get("content-length")) || 0;
  const partial = `${target}.part`;
  const handle = await fs.open(partial, "w");
  let received = 0;
  let shown = -10;
  for await (const chunk of response.body) {
    await handle.write(chunk);
    received += chunk.length;
    const percent = total ? Math.floor((received / total) * 100) : 0;
    if (percent >= shown + 10) {
      shown = percent;
      process.stdout.write(` ${percent}%`);
    }
  }
  await handle.close();
  await fs.rename(partial, target);
  console.log(" ✓");
  return target;
}

let ort = null;
const sessions = new Map();

// mask (0–255) ng foreground, kapareho ng preprocessing ng rembg
async function aiMask(rgba, width, height, modelKey) {
  const model = MODELS[modelKey];
  if (!model) throw new Error(`Walang model na "${modelKey}" (general | anime | lite)`);
  ort ??= await import("onnxruntime-node");
  let session = sessions.get(modelKey);
  if (!session) {
    session = await ort.InferenceSession.create(await ensureModel(model));
    sessions.set(modelKey, session);
  }

  const size = model.size;
  const pixels = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .flatten({ background: "#ffffff" })
    .resize(size, size, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer();
  let max = 1e-6;
  for (const value of pixels) if (value > max) max = value;
  const area = size * size;
  const input = new Float32Array(3 * area);
  for (let i = 0; i < area; i++) {
    for (let ch = 0; ch < 3; ch++) {
      input[ch * area + i] = (pixels[i * 3 + ch] / max - model.mean[ch]) / model.std[ch];
    }
  }

  const results = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, size, size]),
  });
  const prediction = results[session.outputNames[0]].data;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < area; i++) {
    if (prediction[i] < lo) lo = prediction[i];
    if (prediction[i] > hi) hi = prediction[i];
  }
  const range = hi - lo || 1;
  const small = Buffer.alloc(area);
  for (let i = 0; i < area; i++) small[i] = Math.round(((prediction[i] - lo) / range) * 255);
  // extractChannel: siguradong 1 channel ang lalabas (kung hindi, may guhit-guhit na resulta)
  return sharp(small, { raw: { width: size, height: size, channels: 1 } })
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .extractChannel(0)
    .raw()
    .toBuffer();
}

/* ===== Color mode: flood fill mula sa gilid, kaya hindi nabubutas ang puting bahagi sa loob ===== */
function borderStats(rgba, width, height, limit) {
  const samples = [];
  const add = (x, y) => samples.push((y * width + x) * 4);
  for (let x = 0; x < width; x++) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    add(0, y);
    add(width - 1, y);
  }
  const median = [0, 1, 2].map((ch) => {
    const values = samples.map((i) => rgba[i + ch]).sort((a, b) => a - b);
    return values[values.length >> 1];
  });
  const close = samples.filter(
    (i) => Math.hypot(rgba[i] - median[0], rgba[i + 1] - median[1], rgba[i + 2] - median[2]) <= limit,
  ).length;
  return { color: median, uniform: close / samples.length };
}

function colorMask(rgba, width, height, background, tol, feather, holeTol, holeMinArea) {
  const total = width * height;
  const alpha = Buffer.alloc(total, 255);
  const seen = new Uint8Array(total);
  const stack = new Int32Array(total);
  const region = new Int32Array(total);
  const distanceAt = (p) => {
    const i = p * 4;
    return Math.hypot(rgba[i] - background[0], rgba[i + 1] - background[1], rgba[i + 2] - background[2]);
  };

  // flood fill: lahat ng magkakadikit na pixel na hindi lalampas sa `limit`; ibinabalik kung ilan
  function fill(starts, limit) {
    let top = 0;
    let count = 0;
    for (const p of starts) {
      if (!seen[p]) {
        seen[p] = 1;
        stack[top++] = p;
      }
    }
    while (top > 0) {
      const p = stack[--top];
      if (distanceAt(p) > limit) continue; // hangganan ng larawan: mananatiling buo
      region[count++] = p;
      const x = p % width;
      for (const next of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, p - width, p + width]) {
        if (next >= 0 && next < total && !seen[next]) {
          seen[next] = 1;
          stack[top++] = next;
        }
      }
    }
    return count;
  }
  const clear = (count, edgeTol, edgeFeather) => {
    for (let k = 0; k < count; k++) {
      const p = region[k];
      const distance = distanceAt(p);
      alpha[p] = distance <= edgeTol ? 0 : Math.min(255, Math.round(((distance - edgeTol) / edgeFeather) * 255));
    }
  };

  // 1) background na nakadikit sa gilid ng larawan
  const edges = [];
  for (let x = 0; x < width; x++) edges.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) edges.push(y * width, y * width + width - 1);
  clear(fill(edges, tol + feather), tol, feather);

  // 2) "butas" sa loob (hal. loob ng loop ng bow): mas mahigpit na tolerance at dapat sapat ang laki,
  //    para hindi matanggal ang puting bahagi ng mismong larawan (hal. puting puso sa padlock)
  if (holeTol > 0) {
    const holeFeather = Math.max(4, feather / 2);
    for (let p = 0; p < total; p++) {
      if (seen[p] || distanceAt(p) > holeTol) continue;
      const count = fill([p], holeTol + holeFeather);
      if (count >= holeMinArea) clear(count, holeTol, holeFeather);
    }
  }
  return alpha;
}

// alisin ang kulay ng background sa malalambot na gilid (iwas cream/puting "halo")
function defringe(rgba, alpha, background) {
  for (let p = 0; p < alpha.length; p++) {
    const a = alpha[p] / 255;
    if (a <= 0 || a >= 1) continue;
    const i = p * 4;
    for (let ch = 0; ch < 3; ch++) {
      const value = (rgba[i + ch] - (1 - a) * background[ch]) / a;
      rgba[i + ch] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }
}

/* ===== Isang larawan (o isang crop) → transparent webp ===== */
async function cutOne(sourceFile, settings, crop) {
  let image = sharp(sourceFile).ensureAlpha();
  if (crop?.box) {
    const [left, top, width, height] = crop.box.map(Math.round);
    image = image.extract({ left, top, width, height });
  }
  const { data: rgba, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const stats = borderStats(rgba, width, height, settings.tol + settings.feather);
  let mode = settings.mode;
  if (mode === "auto") mode = stats.uniform >= 0.85 ? "color" : "ai";

  let alpha = null;
  if (mode === "color") {
    const holeMinArea = Math.max(150, Math.round(settings.holeMin * width * height));
    alpha = colorMask(rgba, width, height, stats.color, settings.tol, settings.feather, settings.holeTol, holeMinArea);
    defringe(rgba, alpha, stats.color);
  } else if (mode === "ai") {
    alpha = await aiMask(rgba, width, height, settings.model);
  } else if (mode !== "none") {
    throw new Error(`Hindi kilalang mode "${mode}" (auto | color | ai | none)`);
  }
  if (alpha) {
    for (let p = 0; p < alpha.length; p++) rgba[p * 4 + 3] = Math.min(rgba[p * 4 + 3], alpha[p]);
  }

  // erase: mga kahon (coordinates ng orihinal na larawan) na buburahin, hal. dulo ng button o frame
  const [offsetX, offsetY] = crop?.box ?? [0, 0];
  for (const [ex, ey, ew, eh] of crop?.erase ?? []) {
    const x0 = Math.max(0, Math.round(ex - offsetX));
    const y0 = Math.max(0, Math.round(ey - offsetY));
    const x1 = Math.min(width, Math.round(ex - offsetX + ew));
    const y1 = Math.min(height, Math.round(ey - offsetY + eh));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) rgba[(y * width + x) * 4 + 3] = 0;
  }

  // trim: hanapin ang kahon ng mga hindi-transparent na pixel
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("naging transparent ang buong larawan — babaan ang --tol o gamitin ang --mode ai");
  minX = Math.max(0, minX - settings.pad);
  minY = Math.max(0, minY - settings.pad);
  maxX = Math.min(width - 1, maxX + settings.pad);
  maxY = Math.min(height - 1, maxY + settings.pad);
  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;

  let output = sharp(rgba, { raw: { width, height, channels: 4 } }).extract({
    left: minX,
    top: minY,
    width: trimmedWidth,
    height: trimmedHeight,
  });
  const longSide = Math.max(trimmedWidth, trimmedHeight);
  const factor = longSide >= settings.upscaleBelow ? 1 : Math.min(settings.scale, settings.maxSide / longSide);
  const finalWidth = Math.round(trimmedWidth * Math.max(factor, 1));
  const finalHeight = Math.round(trimmedHeight * Math.max(factor, 1));
  // hiwalay na pipeline para sa resize (kailangan munang matapos ang extract)
  if (factor > 1.01) {
    const trimmed = await output.raw().toBuffer();
    output = sharp(trimmed, { raw: { width: trimmedWidth, height: trimmedHeight, channels: 4 } }).resize(
      finalWidth,
      finalHeight,
      { kernel: "lanczos3" },
    );
  }

  const name = crop?.name ?? settings.name ?? toName(sourceFile);
  const target = path.resolve(ROOT, settings.out, `${name}.webp`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await output
    .webp({ quality: settings.quality, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(target);
  const kb = Math.round((await fs.stat(target)).size / 1024);
  console.log(
    `✓ ${path.relative(ROOT, target)}  ${finalWidth}×${finalHeight}  ${kb}KB  (${mode}${mode === "ai" ? `:${settings.model}` : ""})`,
  );
}

/* ===== Grid preview para madaling makuha ang crop coordinates ===== */
async function makeGrid(file) {
  const source = path.isAbsolute(file) ? file : path.join(INBOX, file);
  const { width, height } = await sharp(source).metadata();
  const lines = [];
  for (let x = 0; x <= width; x += 50) {
    const major = x % 100 === 0;
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${major ? "#e8597a" : "#f4a7b9"}" stroke-width="${major ? 1.5 : 0.7}"/>`);
    if (major) lines.push(`<text x="${x + 3}" y="14" font-size="13" fill="#c9405f" font-family="Arial">${x}</text>`);
  }
  for (let y = 0; y <= height; y += 50) {
    const major = y % 100 === 0;
    lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${major ? "#e8597a" : "#f4a7b9"}" stroke-width="${major ? 1.5 : 0.7}"/>`);
    if (major && y > 0) lines.push(`<text x="3" y="${y - 3}" font-size="13" fill="#c9405f" font-family="Arial">${y}</text>`);
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${lines.join("")}</svg>`);
  const target = source.replace(/\.[^.]+$/, ".grid.png");
  await sharp(source).composite([{ input: svg }]).png().toFile(target);
  console.log(`✓ ${path.relative(ROOT, target)}  (${width}×${height}) — basahin dito ang [x, y, lapad, taas] para sa assets.json`);
}

/* ===== Main ===== */
async function main() {
  const cli = parseArgs(process.argv.slice(2));
  if (cli.help) return console.log(HELP);
  if (cli.grid) return makeGrid(cli.grid);

  await fs.mkdir(INBOX, { recursive: true });
  const config = (await exists(CONFIG_FILE)) ? JSON.parse(await fs.readFile(CONFIG_FILE, "utf8")) : {};
  const files = (await fs.readdir(INBOX, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .filter((name) => !name.includes(".grid."))
    .filter((name) => !cli.only || toName(name) === cli.only || name === cli.only);

  if (files.length === 0) {
    console.log(`Walang larawan sa ${path.relative(ROOT, INBOX)}/ — ilagay doon ang mga .png/.jpg/.webp tapos ulitin.`);
    return;
  }

  let failed = 0;
  for (const file of files) {
    const fileConfig = config[file] ?? {};
    const settings = { ...DEFAULTS, ...fileConfig, ...cli };
    const source = path.join(INBOX, file);
    try {
      for (const crop of fileConfig.crops ?? [null]) {
        // settings ng crop > settings ng file; ang CLI flags pa rin ang huling masusunod
        const cropSettings = crop ? { ...DEFAULTS, ...fileConfig, ...crop, ...cli } : settings;
        await cutOne(source, cropSettings, crop);
      }
      if (!settings.keep) {
        await fs.mkdir(DONE, { recursive: true });
        await moveFile(source, path.join(DONE, file));
      }
    } catch (error) {
      failed += 1;
      console.error(`✗ ${file}: ${error.message}`);
    }
  }
  if (failed) process.exitCode = 1;
}

await main();
