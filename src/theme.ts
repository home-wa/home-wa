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

// CSS defaults in global.css. Anything else is emitted as an override.
const DEFAULT_HEAD = 'redhat';
const DEFAULT_BODY = 'redhat';

// Body font: explicit pick, else the heading font's recommended pairing, else Red Hat Text.
export const bodyKey = (t: any = {}) => {
  if (BODY_FONTS[t.body_font]) return t.body_font;
  const head = FONTS[t.heading_font] ? t.heading_font : DEFAULT_HEAD;
  return FONTS[head]?.body || DEFAULT_BODY;
};

// Same logic as themeVars() in public/admin/preview.js. Keep them in sync (small, data-free).
export function themeVars(t: any = {}): Vars {
  const out: Vars = { ...(PRESETS[t.preset] || {}) };
  for (const [k, m] of Object.entries(ROLES)) if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) for (const [v, x] of Object.entries(m)) out[v] = x.split('$').join(t[k]);
  const head = t.heading_font || DEFAULT_HEAD;
  if (head !== DEFAULT_HEAD && FONTS[head]) out.head = `'${FONTS[head].family}',system-ui,sans-serif`;
  const b = bodyKey(t);
  if (b !== DEFAULT_BODY && BODY_FONTS[b]) out.body = `'${BODY_FONTS[b].family}',system-ui,sans-serif`;
  if (t.button_shape && t.button_shape !== 'rounded' && BUTTONS[t.button_shape]) out['btn-radius'] = BUTTONS[t.button_shape];
  return out;
}
// Extra font stylesheets needed beyond the default Red Hat Display + Red Hat Text link.
export function fontLinks(t: any = {}): string[] {
  const l: string[] = [];
  const head = t.heading_font || DEFAULT_HEAD;
  if (FONTS[head] && head !== DEFAULT_HEAD) l.push(g(FONTS[head].css));
  const b = bodyKey(t);
  if (BODY_FONTS[b] && b !== DEFAULT_BODY) l.push(g(BODY_FONTS[b].css));
  return l;
}
export const toCss = (v: Vars) => Object.entries(v).map(([k, x]) => `--${k}:${x}`).join(';');
