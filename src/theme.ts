// Color/font/button themes for the landing page. Data lives in public/theme-presets.json (shared with the Decap preview).
// Picked in Decap (Landing page → Theme) or previewed live with ?palette=a|b|c|d&font=<heading>&body=<body>&buttons=pill|rounded|square.
import T from '../public/theme-presets.json';
export type Vars = Record<string, string>;
export const PRESETS: Record<string, Vars> = T.presets;
export const FONTS: Record<string, { family: string; css: string; body: string }> = T.fonts;
export const BODY_FONTS: Record<string, { family: string; css: string }> = T.bodyFonts;
export const BUTTONS: Record<string, string> = T.buttons;
const ROLES: Record<string, Vars> = T.roles;
const g = (css: string) => `https://fonts.googleapis.com/css2?family=${css}&display=swap`;

// Body font: explicit pick, else the heading font's recommended pairing, else Source Sans 3.
export const bodyKey = (t: any = {}) => (BODY_FONTS[t.body_font] ? t.body_font : (FONTS[t.heading_font]?.body || 'source'));

// Same logic as themeVars() in public/admin/preview.js. Keep them in sync (small, data-free).
export function themeVars(t: any = {}): Vars {
  const out: Vars = { ...(PRESETS[t.preset] || {}) };
  for (const [k, m] of Object.entries(ROLES)) if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) for (const [v, x] of Object.entries(m)) out[v] = x.split('$').join(t[k]);
  if (t.heading_font && t.heading_font !== 'nunito' && FONTS[t.heading_font]) out.head = `'${FONTS[t.heading_font].family}',system-ui,sans-serif`;
  const b = bodyKey(t); if (b !== 'source') out.body = `'${BODY_FONTS[b].family}',system-ui,sans-serif`;
  if (t.button_shape && t.button_shape !== 'rounded' && BUTTONS[t.button_shape]) out['btn-radius'] = BUTTONS[t.button_shape];
  return out;
}
// Extra font stylesheets needed beyond the default Nunito + Source Sans 3 link.
export function fontLinks(t: any = {}): string[] {
  const l: string[] = [];
  if (FONTS[t.heading_font] && t.heading_font !== 'nunito') l.push(g(FONTS[t.heading_font].css));
  const b = bodyKey(t); if (b !== 'source') l.push(g(BODY_FONTS[b].css));
  return l;
}
export const toCss = (v: Vars) => Object.entries(v).map(([k, x]) => `--${k}:${x}`).join(';');
