// Color/font themes for the landing page. Data lives in public/theme-presets.json (shared with the Decap preview).
// Picked in Decap (Landing page → Theme) or previewed live with ?palette=a|b|c|d&font=sora|jakarta|grotesk|nunito.
import T from '../public/theme-presets.json';
export type Vars = Record<string, string>;
export const PRESETS: Record<string, Vars> = T.presets;
export const FONTS: Record<string, { family: string; css: string }> = T.fonts;
const ROLES: Record<string, Vars> = T.roles;
export const fontHref = (k: string) => `https://fonts.googleapis.com/css2?family=${FONTS[k].css}&display=swap`;

// Same logic as themeVars() in public/admin/preview.js. Keep them in sync (small, data-free).
export function themeVars(t: any = {}): Vars {
  const out: Vars = { ...(PRESETS[t.preset] || {}) };
  for (const [k, m] of Object.entries(ROLES)) if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) for (const [v, x] of Object.entries(m)) out[v] = x.split('$').join(t[k]);
  if (t.heading_font && t.heading_font !== 'nunito' && FONTS[t.heading_font]) out.head = `'${FONTS[t.heading_font].family}',system-ui,sans-serif`;
  return out;
}
export const toCss = (v: Vars) => Object.entries(v).map(([k, x]) => `--${k}:${x}`).join(';');
