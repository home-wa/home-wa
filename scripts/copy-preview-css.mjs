// Copies the site stylesheet so the CMS preview pane (/admin) looks like the real page.
import { copyFileSync } from 'node:fs';
copyFileSync('src/styles/global.css', 'public/admin/preview.css');
