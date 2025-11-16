/**
 * Convert OKLCH color to HEX
 * OKLCH -> OKLab -> Linear RGB -> sRGB -> HEX
 */

// Convert OKLCH to OKLab
function oklchToOklab(l, c, h) {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return [l, a, b];
}

// Convert OKLab to Linear RGB
// Using the correct OKLab to LMS to Linear RGB conversion
function oklabToLinearRgb(l, a, b) {
  // Convert OKLab to LMS (non-linear)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  // Apply non-linearity (cube)
  const l_cubed = l_ ** 3;
  const m_cubed = m_ ** 3;
  const s_cubed = s_ ** 3;

  // Convert LMS to Linear RGB
  return [
    +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed,
    -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed,
    -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed,
  ];
}

// Convert Linear RGB to sRGB (gamma correction)
function linearRgbToSrgb(r, g, b) {
  const toSRGB = (c) => {
    if (c <= 0.0031308) {
      return 12.92 * c;
    }
    return 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
  };

  return [toSRGB(r), toSRGB(g), toSRGB(b)];
}

// Clamp and convert to 0-255
function toByte(value) {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Main conversion function
function oklchToHex(oklchString) {
  // Parse oklch(62.3% 0.214 259.815)
  const match = oklchString.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) {
    throw new Error(`Invalid OKLCH format: ${oklchString}`);
  }

  const l = parseFloat(match[1]) / 100; // Convert percentage to 0-1
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  // Convert OKLCH to OKLab
  const [labL, labA, labB] = oklchToOklab(l, c, h);

  // Convert OKLab to Linear RGB
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB);

  // Convert Linear RGB to sRGB
  const [srgbR, srgbG, srgbB] = linearRgbToSrgb(linearR, linearG, linearB);

  // Clamp sRGB values to valid range [0, 1]
  const clampedR = Math.max(0, Math.min(1, srgbR));
  const clampedG = Math.max(0, Math.min(1, srgbG));
  const clampedB = Math.max(0, Math.min(1, srgbB));

  // Convert to bytes
  const r = toByte(clampedR);
  const g = toByte(clampedG);
  const b = toByte(clampedB);

  // Convert to HEX
  return rgbToHex(r, g, b);
}

// Test the conversion with debugging
const color1 = "oklch(62.3% 0.214 259.815)";
const color2 = "oklch(65.6% 0.241 354.308)";

console.log(`Converting: ${color1}`);
const hex1 = oklchToHex(color1);
console.log(`Result: ${hex1}`);

// Parse and show intermediate values for debugging
const match1 = color1.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
if (match1) {
  const l = parseFloat(match1[1]) / 100;
  const c = parseFloat(match1[2]);
  const h = parseFloat(match1[3]);
  const [labL, labA, labB] = oklchToOklab(l, c, h);
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB);
  const [srgbR, srgbG, srgbB] = linearRgbToSrgb(linearR, linearG, linearB);
  console.log(`  OKLab: L=${labL.toFixed(4)}, a=${labA.toFixed(4)}, b=${labB.toFixed(4)}`);
  console.log(`  Linear RGB: R=${linearR.toFixed(4)}, G=${linearG.toFixed(4)}, B=${linearB.toFixed(4)}`);
  console.log(`  sRGB: R=${srgbR.toFixed(4)}, G=${srgbG.toFixed(4)}, B=${srgbB.toFixed(4)}`);
}

console.log(`\nConverting: ${color2}`);
const hex2 = oklchToHex(color2);
console.log(`Result: ${hex2}`);

// Parse and show intermediate values for debugging
const match2 = color2.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
if (match2) {
  const l = parseFloat(match2[1]) / 100;
  const c = parseFloat(match2[2]);
  const h = parseFloat(match2[3]);
  const [labL, labA, labB] = oklchToOklab(l, c, h);
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB);
  const [srgbR, srgbG, srgbB] = linearRgbToSrgb(linearR, linearG, linearB);
  console.log(`  OKLab: L=${labL.toFixed(4)}, a=${labA.toFixed(4)}, b=${labB.toFixed(4)}`);
  console.log(`  Linear RGB: R=${linearR.toFixed(4)}, G=${linearG.toFixed(4)}, B=${linearB.toFixed(4)}`);
  console.log(`  sRGB: R=${srgbR.toFixed(4)}, G=${srgbG.toFixed(4)}, B=${srgbB.toFixed(4)}`);
}

console.log(`\nSVG gradient colors:`);
console.log(`  <stop offset="0" stop-color="${hex1}" />`);
console.log(`  <stop offset="1" stop-color="${hex2}" />`);

