/**
 * PNG Exporter for On-Chain NFTs
 *
 * Converts SVG sprites to optimized PNG format for Bitcoin inscriptions.
 * Uses indexed color palette (4-bit, 16 colors max) for minimal size.
 *
 * Target: 32x32 pixel art @ ~200-600 bytes per image
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PNGExportOptions {
  /** Output size in pixels (default: 32) */
  size?: number;
  /** Use indexed color palette (default: true) */
  indexed?: boolean;
  /** Max colors in palette (default: 16) */
  maxColors?: number;
  /** PNG compression level 0-9 (default: 9) */
  compressionLevel?: number;
  /** Background color (default: transparent) */
  backgroundColor?: string;
}

export interface ExportResult {
  /** Base64 encoded PNG data */
  base64: string;
  /** Raw PNG bytes */
  bytes: Uint8Array;
  /** File size in bytes */
  size: number;
  /** Data URI for direct use */
  dataUri: string;
  /** Colors used in image */
  colorCount: number;
}

export interface SpriteComponent {
  /** Component name (e.g., "human_head", "royal_crown") */
  name: string;
  /** SVG string of the component */
  svg: string;
  /** Category (base, bloodline, heritage, effect) */
  category: "base" | "bloodline" | "heritage" | "effect" | "accessory";
  /** Optional layer order */
  zIndex?: number;
}

// =============================================================================
// SVG TO CANVAS
// =============================================================================

/**
 * Render SVG string to canvas
 */
export async function svgToCanvas(
  svgString: string,
  size: number = 32,
): Promise<HTMLCanvasElement> {
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Enable pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;

  // Create image from SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load SVG: ${e}`));
    };
    img.src = url;
  });
}

// =============================================================================
// COLOR QUANTIZATION (for indexed PNG)
// =============================================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RGBA extends RGB {
  a: number;
}

/**
 * Extract unique colors from image data
 */
function extractColors(imageData: ImageData): Map<string, RGBA> {
  const colors = new Map<string, RGBA>();
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip fully transparent pixels
    if (a === 0) continue;

    const key = `${r},${g},${b},${a}`;
    if (!colors.has(key)) {
      colors.set(key, { r, g, b, a });
    }
  }

  return colors;
}

/**
 * Simple median cut color quantization
 */
function quantizeColors(colors: RGBA[], maxColors: number): RGBA[] {
  if (colors.length <= maxColors) return colors;

  // Sort by luminance and take evenly distributed samples
  const sorted = colors.sort((a, b) => {
    const lumA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
    const lumB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
    return lumA - lumB;
  });

  const step = Math.floor(sorted.length / maxColors);
  const palette: RGBA[] = [];

  for (let i = 0; i < maxColors; i++) {
    palette.push(sorted[Math.min(i * step, sorted.length - 1)]);
  }

  return palette;
}

/**
 * Find closest color in palette
 */
function findClosestColor(color: RGBA, palette: RGBA[]): number {
  let minDist = Infinity;
  let closest = 0;

  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dist =
      Math.pow(color.r - p.r, 2) +
      Math.pow(color.g - p.g, 2) +
      Math.pow(color.b - p.b, 2) +
      Math.pow(color.a - p.a, 2);

    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }

  return closest;
}

// =============================================================================
// PNG ENCODING (minimal implementation for indexed PNG)
// =============================================================================

/**
 * CRC32 for PNG chunks
 */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  const table = new Uint32Array(256);

  // Generate CRC table
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  // Calculate CRC
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Create PNG chunk
 */
function createChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(chunk.buffer);

  // Length
  view.setUint32(0, data.length, false);

  // Type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  // Data
  chunk.set(data, 8);

  // CRC (type + data)
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(chunk.slice(4, 8), 0);
  crcData.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcData), false);

  return chunk;
}

/**
 * Adler-32 checksum for zlib
 */
function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

/**
 * Simple deflate (store only - no compression, for small images)
 * For production, use pako or similar library
 */
function deflateStore(data: Uint8Array): Uint8Array {
  const blocks: Uint8Array[] = [];
  const maxBlockSize = 65535;

  for (let i = 0; i < data.length; i += maxBlockSize) {
    const blockData = data.slice(i, Math.min(i + maxBlockSize, data.length));
    const isLast = i + maxBlockSize >= data.length;

    const block = new Uint8Array(5 + blockData.length);
    block[0] = isLast ? 0x01 : 0x00; // BFINAL + BTYPE=00 (stored)
    block[1] = blockData.length & 0xff;
    block[2] = (blockData.length >> 8) & 0xff;
    block[3] = ~blockData.length & 0xff;
    block[4] = (~blockData.length >> 8) & 0xff;
    block.set(blockData, 5);
    blocks.push(block);
  }

  // Combine blocks
  const totalLength = blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(2 + totalLength + 4); // zlib header + blocks + adler32

  // Zlib header (deflate, no dict)
  result[0] = 0x78;
  result[1] = 0x01;

  let offset = 2;
  for (const block of blocks) {
    result.set(block, offset);
    offset += block.length;
  }

  // Adler-32
  const adler = adler32(data);
  result[offset] = (adler >> 24) & 0xff;
  result[offset + 1] = (adler >> 16) & 0xff;
  result[offset + 2] = (adler >> 8) & 0xff;
  result[offset + 3] = adler & 0xff;

  return result;
}

/**
 * Encode indexed PNG
 */
function encodeIndexedPNG(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: RGBA[],
): Uint8Array {
  const chunks: Uint8Array[] = [];

  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  chunks.push(signature);

  // IHDR chunk
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 4; // bit depth (4 bits = 16 colors)
  ihdr[9] = 3; // color type (indexed)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createChunk("IHDR", ihdr));

  // PLTE chunk (palette)
  const plte = new Uint8Array(palette.length * 3);
  for (let i = 0; i < palette.length; i++) {
    plte[i * 3] = palette[i].r;
    plte[i * 3 + 1] = palette[i].g;
    plte[i * 3 + 2] = palette[i].b;
  }
  chunks.push(createChunk("PLTE", plte));

  // tRNS chunk (transparency)
  const hasTransparency = palette.some((c) => c.a < 255);
  if (hasTransparency) {
    const trns = new Uint8Array(palette.length);
    for (let i = 0; i < palette.length; i++) {
      trns[i] = palette[i].a;
    }
    chunks.push(createChunk("tRNS", trns));
  }

  // IDAT chunk (image data)
  // Pack 2 pixels per byte (4-bit indexed)
  const rowBytes = Math.ceil(width / 2);
  const rawData = new Uint8Array(height * (1 + rowBytes)); // +1 for filter byte per row

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    rawData[rowOffset] = 0; // No filter

    for (let x = 0; x < width; x += 2) {
      const px1 = pixels[y * width + x] & 0x0f;
      const px2 = x + 1 < width ? pixels[y * width + x + 1] & 0x0f : 0;
      rawData[rowOffset + 1 + Math.floor(x / 2)] = (px1 << 4) | px2;
    }
  }

  const compressed = deflateStore(rawData);
  chunks.push(createChunk("IDAT", compressed));

  // IEND chunk
  chunks.push(createChunk("IEND", new Uint8Array(0)));

  // Combine all chunks
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const png = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    png.set(chunk, offset);
    offset += chunk.length;
  }

  return png;
}

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

/**
 * Export SVG to optimized PNG
 */
export async function exportSVGtoPNG(
  svgString: string,
  options: PNGExportOptions = {},
): Promise<ExportResult> {
  const {
    size = 32,
    indexed = true,
    maxColors = 16,
    backgroundColor,
  } = options;

  // Render SVG to canvas
  const canvas = await svgToCanvas(svgString, size);
  const ctx = canvas.getContext("2d")!;

  // Apply background if specified
  if (backgroundColor) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, size, size);
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  // Get image data
  const imageData = ctx.getImageData(0, 0, size, size);

  if (indexed) {
    // Extract and quantize colors
    const colorsMap = extractColors(imageData);
    const colors = Array.from(colorsMap.values());

    // Add transparent color at index 0 if needed
    const hasTransparent = imageData.data.some(
      (_, i) => i % 4 === 3 && imageData.data[i] === 0,
    );
    let palette = quantizeColors(
      colors,
      hasTransparent ? maxColors - 1 : maxColors,
    );
    if (hasTransparent) {
      palette = [{ r: 0, g: 0, b: 0, a: 0 }, ...palette];
    }

    // Map pixels to palette indices
    const pixels = new Uint8Array(size * size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIdx = i / 4;
      const a = imageData.data[i + 3];

      if (a === 0) {
        pixels[pixelIdx] = 0; // Transparent
      } else {
        const color: RGBA = {
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2],
          a,
        };
        pixels[pixelIdx] = findClosestColor(color, palette);
      }
    }

    // Encode as indexed PNG
    const pngBytes = encodeIndexedPNG(size, size, pixels, palette);
    const base64 = btoa(String.fromCharCode(...pngBytes));

    return {
      base64,
      bytes: pngBytes,
      size: pngBytes.length,
      dataUri: `data:image/png;base64,${base64}`,
      colorCount: palette.length,
    };
  } else {
    // Use canvas toBlob for non-indexed PNG
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const buffer = await blob!.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const base64 = btoa(String.fromCharCode(...bytes));

        resolve({
          base64,
          bytes,
          size: bytes.length,
          dataUri: `data:image/png;base64,${base64}`,
          colorCount: extractColors(imageData).size,
        });
      }, "image/png");
    });
  }
}

/**
 * Export multiple sprites as a sprite sheet
 */
export async function exportSpriteSheet(
  sprites: SpriteComponent[],
  options: PNGExportOptions = {},
): Promise<{
  sprites: Map<string, ExportResult>;
  totalSize: number;
  manifest: SpriteManifest;
}> {
  const results = new Map<string, ExportResult>();
  let totalSize = 0;

  for (const sprite of sprites) {
    const result = await exportSVGtoPNG(sprite.svg, options);
    results.set(sprite.name, result);
    totalSize += result.size;
  }

  const manifest: SpriteManifest = {
    version: 1,
    spriteSize: options.size || 32,
    totalSprites: sprites.length,
    totalBytes: totalSize,
    sprites: sprites.map((s, i) => ({
      name: s.name,
      category: s.category,
      index: i,
      size: results.get(s.name)!.size,
      zIndex: s.zIndex || 0,
    })),
  };

  return { sprites: results, totalSize, manifest };
}

// =============================================================================
// MANIFEST TYPE
// =============================================================================

export interface SpriteManifest {
  version: number;
  spriteSize: number;
  totalSprites: number;
  totalBytes: number;
  sprites: Array<{
    name: string;
    category: string;
    index: number;
    size: number;
    zIndex: number;
  }>;
}

/**
 * Generate manifest JSON for inscription
 */
export function generateManifest(manifest: SpriteManifest): string {
  return JSON.stringify(manifest, null, 0); // Minified
}
