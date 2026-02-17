#!/usr/bin/env node
/**
 * Icon Generator for BitcoinBaby PWA
 *
 * This script generates placeholder PNG icons from the SVG source.
 * Run with: node scripts/generate-icons.mjs
 *
 * For production, replace these with proper pixel art icons.
 * You can use tools like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Simple SVG template for placeholder icons
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#0f0f1b"/>
  <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.5}" fill="#f7931a" rx="${size * 0.0625}"/>
  <text x="${size * 0.5}" y="${size * 0.57}" font-family="monospace" font-size="${size * 0.23}" font-weight="bold" fill="#0f0f1b" text-anchor="middle">B</text>
  <circle cx="${size * 0.35}" cy="${size * 0.39}" r="${size * 0.047}" fill="#4fc3f7"/>
  <circle cx="${size * 0.65}" cy="${size * 0.39}" r="${size * 0.047}" fill="#4fc3f7"/>
</svg>`;

// Maskable icon has more padding for safe area
const createMaskableSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#0f0f1b"/>
  <rect x="${size * 0.3}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.4}" fill="#f7931a" rx="${size * 0.05}"/>
  <text x="${size * 0.5}" y="${size * 0.55}" font-family="monospace" font-size="${size * 0.18}" font-weight="bold" fill="#0f0f1b" text-anchor="middle">B</text>
  <circle cx="${size * 0.4}" cy="${size * 0.44}" r="${size * 0.035}" fill="#4fc3f7"/>
  <circle cx="${size * 0.6}" cy="${size * 0.44}" r="${size * 0.035}" fill="#4fc3f7"/>
</svg>`;

console.log('Generating PWA placeholder icons...');
console.log('Icons directory:', iconsDir);
console.log('');

// Generate regular icons as SVG (browsers can use SVG icons)
for (const size of sizes) {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = join(iconsDir, filename);
  const svg = createSvgIcon(size);
  writeFileSync(filepath, svg, 'utf8');
  console.log(`Created: ${filename}`);
}

// Generate maskable icons
for (const size of [192, 512]) {
  const filename = `icon-maskable-${size}x${size}.svg`;
  const filepath = join(iconsDir, filename);
  const svg = createMaskableSvgIcon(size);
  writeFileSync(filepath, svg, 'utf8');
  console.log(`Created: ${filename}`);
}

console.log('');
console.log('Done! SVG placeholder icons have been generated.');
console.log('');
console.log('NOTE: For production, generate PNG icons using one of these tools:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('');
console.log('You can convert these SVGs to PNG using:');
console.log('- Inkscape: inkscape -w 192 -h 192 icon.svg -o icon-192x192.png');
console.log('- ImageMagick: convert -background none icon.svg -resize 192x192 icon-192x192.png');
console.log('- Sharp (npm): npx sharp-cli icon.svg -o icon-192x192.png -w 192 -h 192');
