// Color/font themes for the landing page. "current" = the CSS defaults in global.css (no overrides emitted).
// Picked in Decap (Landing page → Theme) or previewed live with ?palette=a|b|c|d&font=sora|jakarta|grotesk|nunito.
export type Vars = Record<string, string>;

export const PRESETS: Record<string, Vars> = {
  current: {},
  // A · Brand Classic: logo navy + green with periwinkle/mint tints
  a: { blue: '#283888', 'blue-dark': '#1F2C6E', 'blue-bright': '#0F6AA8', focus: '#0F6AA8', green: '#3FA846', 'green-hover': '#52B858', 'green-text': '#1E7A2E', 'on-accent': '#10261A',
       ink: '#1C2240', 'ink-soft': '#3A4060', muted: '#4A5068', cloud: '#EEF0FA', sky: '#E6EAF7', mint: '#E3F2E4', teal: '#E4F0F8', line: '#D5DAF0',
       'header-bg': '#FFFFFF', 'header-text': '#3A4060', 'header-link': '#283888' },
  // B · Light & Airy: original periwinkle #A7B0DA header, mint #9BCEA0 accent, deep periwinkle buttons
  b: { blue: '#3D4C9E', 'blue-dark': '#2A3470', 'blue-bright': '#2A3470', focus: '#2A3470', green: '#9BCEA0', 'green-hover': '#B3DAB7', 'green-text': '#2E6B36', 'on-accent': '#16331B',
       ink: '#22252D', 'ink-soft': '#3A3F4C', muted: '#4C5263', cloud: '#F6F7FE', sky: '#ECEEF9', mint: '#E6F3E8', teal: '#E4F5F8', line: '#D3D8EE',
       'header-bg': '#A7B0DA', 'header-text': '#1C2240', 'header-link': '#1C2240', 'on-dark': '#E6E9F7' },
  // C · Bold Modern: deep ink header, electric blue buttons, fresh green, sun-yellow badge
  c: { blue: '#141B3C', 'blue-dark': '#2A3570', 'blue-bright': '#0070A8', focus: '#0070A8', green: '#52B858', 'green-hover': '#6CC771', 'green-text': '#1E7A2E', 'on-accent': '#0E2412',
       ink: '#141B3C', 'ink-soft': '#2D3550', muted: '#454C63', cloud: '#F2F4FA', sky: '#E6EAF5', mint: '#FFF3CC', teal: '#E2F0F8', line: '#D6DAE6',
       'header-bg': '#141B3C', 'header-text': '#FFFFFF', 'header-link': '#FFFFFF', 'join-bg': '#0070A8', 'join-hover': '#005A88', 'logo-filter': 'brightness(0) invert(1)' },
  // D · Mint Header: Brand Classic with the original-site mint #9BCEA0 as the header
  d: { blue: '#283888', 'blue-dark': '#1F2C6E', 'blue-bright': '#0F6AA8', focus: '#1F2C6E', green: '#3FA846', 'green-hover': '#52B858', 'green-text': '#1E7A2E', 'on-accent': '#10261A',
       ink: '#1C2240', 'ink-soft': '#2E3550', muted: '#4A5068', cloud: '#F1F8F2', sky: '#EEF0FA', mint: '#E3F2E4', teal: '#E4F0F8', line: '#CFE3D2',
       'header-bg': '#9BCEA0', 'header-text': '#1C2240', 'header-link': '#1C2240' },
};

export const FONTS: Record<string, { family: string; css: string }> = {
  nunito: { family: 'Nunito', css: 'Nunito:wght@700;800' },
  sora: { family: 'Sora', css: 'Sora:wght@600;700;800' },
  jakarta: { family: 'Plus Jakarta Sans', css: 'Plus+Jakarta+Sans:wght@600;700;800' },
  grotesk: { family: 'Space Grotesk', css: 'Space+Grotesk:wght@600;700' },
};
export const fontHref = (k: string) => `https://fonts.googleapis.com/css2?family=${FONTS[k].css}&display=swap`;

// Decap color overrides → CSS variables (derived shades use color-mix so one pick is enough).
const ROLE: Record<string, (v: string) => Vars> = {
  primary: (v) => ({ blue: v, 'blue-dark': `color-mix(in srgb, ${v} 80%, #000)`, 'join-bg': v, 'join-hover': `color-mix(in srgb, ${v} 80%, #000)` }),
  secondary: (v) => ({ 'blue-bright': v }),
  accent: (v) => ({ green: v, 'green-hover': `color-mix(in srgb, ${v} 85%, #fff)` }),
  header_bg: (v) => ({ 'header-bg': v }),
  header_text: (v) => ({ 'header-text': v, 'header-link': v }),
  light_bg: (v) => ({ cloud: v }),
  dark_text: (v) => ({ ink: v, 'ink-soft': v }),
};

export function themeVars(t: any = {}): Vars {
  const out: Vars = { ...(PRESETS[t.preset] || {}) };
  for (const [k, f] of Object.entries(ROLE)) if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) Object.assign(out, f(t[k]));
  if (t.heading_font && t.heading_font !== 'nunito' && FONTS[t.heading_font]) out.head = `'${FONTS[t.heading_font].family}',system-ui,sans-serif`;
  return out;
}
export const toCss = (v: Vars) => Object.entries(v).map(([k, x]) => `--${k}:${x}`).join(';');
