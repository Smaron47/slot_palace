# Spin Palace Static Demo

This folder is a separate, backend-free showcase for GitHub Pages. It contains
the public game lobby, the 39 configured game pages and their shared assets,
plus a read-only admin-panel preview.

## Publish on GitHub Pages

1. Create a GitHub repository for the demo.
2. Upload the **contents** of this folder to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, select the `main` branch and `/ (root)`,
   then save.
5. Wait for GitHub Pages to publish the URL shown in the Pages settings.

The site uses relative asset and game links, so it works both at a project URL
such as `https://username.github.io/repository/` and at a user-site root.

## Preview locally

Run a static file server from this folder:

```sh
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000>. Do not open `index.html` directly as a
`file://` URL; the browser needs HTTP to load the game catalogue.

## What is and is not included

- `index.html` is a static lobby; clicking a game opens its HTML page.
- `admin.html` is a read-only UI mockup with sample counts and game rows.
- There is no Flask service, database, authentication, payment, or real admin
  functionality in this folder.
- Game pages use virtual/demo credits only. Outcomes are not server-verified.
- Some included game artwork is loaded from third-party CDNs. Verify its
  license and network availability before commercial distribution.

