# H.O.M.E. landing page

Static landing page for **H.O.M.E. (Home Oriented Meaningful Education)**, built with [Astro](https://astro.build), edited with [Decap CMS](https://decapcms.org) at `/admin`, and hosted on Firebase Hosting. Every membership action links to Join It.

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs dist/
npm run preview    # serve dist/ locally
```

## Editing content

All text, images and links live in **`src/content/home/index.yml`**. The page template (`src/pages/index.astro`) renders the `sections` list in order, so sections can be reordered, removed or duplicated. Styles are in `src/styles/global.css`.

- **In the browser:** go to `https://<site>/admin`, log in with GitHub, edit "Pages → Landing page", and Publish. Decap commits to `main`, which triggers a deploy.
- **Locally without GitHub login:** run `npm run dev` and `npx decap-server` in two terminals, then open http://localhost:4321/admin.
- **Images:** uploads go to `public/uploads/`. The hero and About photos are empty until real photos are added (a placeholder box shows instead).
- **Join It links:** set `links.join`, `links.login`, `links.portal` (Join It dashboard → Member Portal → Portal Widgets → Button or Link Widget). Values starting with `JOINIT_` render as `#`.

## CMS login (GitHub OAuth helper) — TODO

Decap's `github` backend needs a small OAuth helper; Firebase Hosting alone cannot do it. `public/admin/config.yml` has `base_url: https://TODO-OAUTH-HELPER.example.com` as a placeholder.

1. Deploy an OAuth helper, e.g. [sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy) (Cloudflare Worker, free) or [vencax/netlify-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider).
2. In the `home-wa` GitHub org: Settings → Developer settings → OAuth Apps → New. Homepage URL = the site URL; Authorization callback URL = `https://<helper-host>/callback`.
3. Give the helper the OAuth app's Client ID and Client Secret (as secrets in the helper's host, never in this repo).
4. Set `backend.base_url` in `public/admin/config.yml` to the helper URL (and `auth_endpoint` if it is not `auth`).
5. Editors need write access to `home-wa/home-wa`.

## Deploys

`.github/workflows/deploy.yml` builds and deploys to Firebase Hosting on every push to `main` (and on manual dispatch) using `FirebaseExtended/action-hosting-deploy`.

Setup required once:
- Set the Firebase project id in `.firebaserc` and in `projectId:` in the workflow (`home-wa`).
- Add repo secret `FIREBASE_SERVICE_ACCOUNT_HOME_WA` with the JSON key of a service account that has the **Firebase Hosting Admin** role (plus *Service Account User* / *API Keys Viewer* as the action's docs recommend). Easiest: `firebase init hosting:github`, or create the key and `gh secret set FIREBASE_SERVICE_ACCOUNT_HOME_WA -R home-wa/home-wa < key.json`, then delete the key file.

The project runs on the free Spark plan. The custom domain (home-wa.org) is not connected yet; add it later in Firebase console → Hosting → Add custom domain.
