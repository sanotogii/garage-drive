# Garage Drive

A small, self-hosted web file manager for a [Garage](https://garagehq.deuxfleurs.fr/) (or any S3-compatible) bucket. Browse virtual folders, preview files, upload with progress, download, and delete — without ever exposing your S3 credentials to the browser.

Built with Next.js 15 (App Router), React 19, and TypeScript. Styled as a garage workshop: hard shadows, safety-orange accents, and a storage gauge.

## Features

- Browse S3 prefixes as folders, in grid or list view
- Drag-and-drop or pick-file uploads with a live progress indicator
- Inline previews for images, video, audio, PDF, and text files
- Download (including HTTP range requests for media seeking) and delete
- Search within the current folder
- Light/dark theme, remembered in `localStorage`
- Storage gauge against a 3 GiB quota, refreshed after uploads/deletes
- Optional HTTP Basic authentication via `APP_PASSWORD`

## Quick start

Requirements: Node.js 18.18+ and an S3-compatible bucket (Garage, MinIO, etc.).

```bash
npm install
cp .env.local.example .env.local
# edit .env.local with your endpoint, bucket, and keys
npm run dev
```

Open <http://localhost:3000>. To reach it from another device on your network, use `http://<machine-ip>:3000` (the dev server listens on `0.0.0.0`).

## Configuration

Settings are read from `.env.local` (or any environment source) at runtime.

| Variable | Required | Description |
| --- | --- | --- |
| `S3_ENDPOINT` | Yes | S3 API endpoint, e.g. `http://127.0.0.1:3900`. |
| `S3_REGION` | No | Signing region. Defaults to `garage`. |
| `S3_BUCKET` | Yes | Bucket to manage. |
| `S3_KEY_ID` | Yes | S3 access key ID. |
| `S3_SECRET` | Yes | S3 secret access key. |
| `APP_PASSWORD` | No | Enables Basic auth when set (any username works). Leave empty to disable. |

The storage quota shown in the sidebar is `BUCKET_LIMIT_BYTES` in [`lib/s3.ts`](lib/s3.ts), defaulting to 3 GiB (`3 * 1024 ** 3`). Adjust it if your provider uses decimal GB.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on `0.0.0.0:3000`. |
| `npm run build` | Production build (`output: "standalone"`). |
| `npm start` | Start the production server locally. |
| `npx tsc --noEmit` | Type-check without emitting files. |

## How it works

All bucket access happens on the server; the browser only calls this app's API routes.

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/files` | `GET` | List one folder (`prefix`) using S3 `Delimiter: "/"`. |
| `/api/files` | `POST` | Multipart upload of one or more files into `prefix`. |
| `/api/files` | `DELETE` | Delete the object at `?key=`. |
| `/api/download` | `GET` | Stream an object. `inline=1` for previews; supports `Range`. |
| `/api/usage` | `GET` | Sum all object sizes (paginated) and return used/limit/remaining bytes. |

Shared client setup and the Basic-auth check live in [`lib/s3.ts`](lib/s3.ts).

```
app/
  layout.tsx            Root layout, theme bootstrap
  page.tsx              Main file-manager UI (client component)
  globals.css           Theme and layout
  api/
    files/route.ts      List, upload, delete
    download/route.ts   Stream downloads and previews
    usage/route.ts      Bucket usage for the storage gauge
lib/s3.ts               S3 client, bucket limit, auth guard
```

## Deployment

`next build` uses `output: "standalone"`, so the production server only needs `node app/server.js` from the standalone bundle:

```bash
npm run build
cp -r .next/static .next/standalone/.next/static
node .next/standalone/server.js
```

The included `Jenkinsfile` builds a tarball and deploys it to an Android/Termux host running proot Ubuntu:

- [`deploy/start.sh`](deploy/start.sh) runs in Termux: stops the old process, unpacks the build, and launches proot.
- [`deploy/run.sh`](deploy/run.sh) runs inside proot: loads `.env.local` and execs `node app/server.js` on port 3000.

`npm start` (`next start`) still works for local checks, but Next warns when `output: "standalone"` is set; prefer the standalone server for deployment.

## Notes and limits

- Folders are virtual S3 prefixes. A new empty folder does not exist until a file is uploaded into it.
- Uploads pass through the server and are buffered in memory, so the host needs enough RAM for the largest single upload.
- Folder listings read the first 1000 objects/prefixes; the usage endpoint paginates the whole bucket.
- The 3 GiB quota is display-only — uploads are not blocked if the bucket exceeds it (Garage's own quota, if any, is authoritative).
- The auth check is HTTP Basic with any username. Put the app behind HTTPS (reverse proxy or tunnel) before exposing it to the internet.
- Single shared password; there are no per-user accounts or permissions.
