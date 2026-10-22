// Minimal GitHub OAuth helper for Decap CMS.
// Hosting rewrites /api/** to this function:
//   /api/auth     -> redirects to GitHub's authorize page
//   /api/callback -> exchanges the code and posts the token back to the Decap window
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import crypto from 'node:crypto';

const CLIENT_ID = defineSecret('GITHUB_OAUTH_CLIENT_ID');
const CLIENT_SECRET = defineSecret('GITHUB_OAUTH_CLIENT_SECRET');
const SITE = 'https://home-wa.web.app';
const CALLBACK = `${SITE}/api/callback`;

// Firebase Hosting only forwards the cookie named __session.
const getState = (req) => (req.headers.cookie || '').match(/(?:^|;\s*)__session=([^;]+)/)?.[1];

const page = (status, content) => `<!doctype html><html><body><p>Completing login…</p><script>
(function () {
  var msg = ${JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`)};
  function receive(e) { window.opener.postMessage(msg, e.origin); window.removeEventListener('message', receive); }
  window.addEventListener('message', receive, false);
  window.opener && window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;

export const oauth = onRequest(
  { region: 'us-central1', secrets: [CLIENT_ID, CLIENT_SECRET], maxInstances: 2, memory: '256MiB' },
  async (req, res) => {
    const path = req.path.replace(/^\/api/, '');
    res.set('Cache-Control', 'private, no-store');

    if (path === '/auth') {
      const state = crypto.randomBytes(16).toString('hex');
      res.cookie('__session', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 });
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', CLIENT_ID.value());
      url.searchParams.set('redirect_uri', CALLBACK);
      url.searchParams.set('scope', req.query.scope || 'repo,user');
      url.searchParams.set('state', state);
      return res.redirect(302, url.toString());
    }

    if (path === '/callback') {
      const { code, state } = req.query;
      if (!code || !state || state !== getState(req)) {
        return res.status(400).send(page('error', { message: 'Invalid OAuth state. Please try logging in again.' }));
      }
      try {
        const r = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: CLIENT_ID.value(), client_secret: CLIENT_SECRET.value(), code, redirect_uri: CALLBACK }),
        });
        const data = await r.json();
        if (!data.access_token) return res.status(401).send(page('error', { message: data.error_description || 'GitHub login failed.' }));
        return res.send(page('success', { token: data.access_token, provider: 'github' }));
      } catch (e) {
        return res.status(500).send(page('error', { message: 'GitHub login failed.' }));
      }
    }

    res.status(404).send('Not found');
  }
);
