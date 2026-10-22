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

Content lives in two YAML files:

- `src/content/settings.yml` holds the site info, Join It links, contact email, top menu and footer.
- `src/content/layout.yml` is the **page layout**: an ordered list of sections, each with a `type`.
  - Section types: `hero`, `about`, `programs`, `benefits`, `events`, `faq`, `cta`, plus the generic `textphoto` (Text + photo) and `text` (Simple text) blocks.
  - Each section has a `show` switch to hide it without deleting it.

Anchors are automatic. Known section types get fixed anchors (`top`, `about`, `programs`, `benefits`, `events`, `faq`, `join`), and repeats or generic blocks get `section-2`, `section-3` and so on. Menu links pointing at a section that isn't on the page are left out. Styles are in `src/styles/global.css`. `npm run dev/build` copies that CSS to `public/admin/preview.css` so the CMS preview matches the site.

- **In the browser:** go to `https://home-wa.web.app/admin`, log in with GitHub, choose **Page layout → Home page** to edit, add (Add section), drag to reorder, or remove sections, or **Site settings** for links, contact, menu and footer. Then click Publish. Decap commits to `main`, which triggers a deploy (about 2 minutes).
- **Preview:** `public/admin/preview.js` renders the whole layout with the real site styles. `/admin/**` is served with `Cache-Control: no-cache`, so config changes show up right away.
- **Locally without GitHub login:** run `npm run dev` and `npx decap-server` in two terminals, then open http://localhost:4321/admin/index.html.
- **Images:** uploads go to `public/uploads/`.
- **Join It links:** go to Site settings > Join It links. Values starting with `JOINIT_` render as `#`.

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

## CMS login helper (Cloud Function) — final steps

The OAuth helper lives in `functions/` (function `cmsauth`, us-central1), served at `/api/auth` and `/api/callback` via the Hosting rewrite. Project `home-wa` is on Blaze and the required APIs are enabled.

1. Create a GitHub OAuth App owned by the `home-wa` org with callback `https://home-wa.web.app/api/callback`.
2. Set the secrets (paste the value on stdin, never on the command line):
   `firebase functions:secrets:set GITHUB_OAUTH_CLIENT_ID --project home-wa` and
   `firebase functions:secrets:set GITHUB_OAUTH_CLIENT_SECRET --project home-wa`
3. `firebase deploy --only functions,hosting --project home-wa`
4. Set image cleanup: `firebase functions:artifacts:setpolicy --location us-central1 --days 1 --project home-wa --force`
   (a keep-latest-2 count policy needs `gcloud artifacts repositories set-cleanup-policies`).
5. Merge this branch into `main`.
