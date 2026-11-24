# Garage Drive

A small Next.js web app to browse, upload, download and delete files in a Garage (S3) bucket.
S3 credentials stay on the server; the browser only talks to this app's `/api` routes.

## Run

    npm install
    cp .env.local.example .env.local
    nano .env.local
    npm run dev

Open http://localhost:3000 (or http://<machine-ip>:3000 from another device).

## Notes
- Folders are virtual (S3 prefixes). An empty new folder appears only after you upload a file into it.
- Uploads pass through the server and are held in memory, so very large files need enough RAM.
- Lists up to 1000 items per folder. Set APP_PASSWORD, and put it behind HTTPS before exposing it.
