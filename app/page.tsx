"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

const P = {
  folder: "M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
  file: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z",
  search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  down: "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  grid: "M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z",
  list: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
  drive: "M7.7 3h8.6l6 10.4-4.3 7.4H6L1.7 13.4 7.7 3z",
  sun: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2zM5.99 4.58L4.58 5.99l1.41 1.41 1.41-1.41-1.41-1.41zm12.02 12.02l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41zM18.01 4.58l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41zM6.99 16.6l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41z",
  moon: "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
};
const Icon = ({ d, color, s = 24 }: { d: string; color?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={color || "currentColor"} aria-hidden="true"><path d={d} /></svg>
);

const COLORS: Record<string, string> = { img: "#188038", pdf: "#d93025", doc: "#1a73e8", vid: "#d93025", zip: "#5f6368" };
const EXT: Record<string, string> = {
  png: "img", jpg: "img", jpeg: "img", gif: "img", webp: "img", svg: "img",
  pdf: "pdf", doc: "doc", docx: "doc", txt: "doc", md: "doc", odt: "doc", xls: "doc", xlsx: "doc", csv: "doc", ppt: "doc", pptx: "doc",
  mp4: "vid", mkv: "vid", mov: "vid", mp3: "vid", zip: "zip", gz: "zip", tar: "zip", rar: "zip", "7z": "zip",
};
const ext = (n: string) => n.split(".").pop()!.toLowerCase();
const fileColor = (n: string) => COLORS[EXT[ext(n)]] || "#5f6368";

const size = (n: number) => {
  if (n < 1024) return n + " B";
  const u = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < 3);
  return n.toFixed(1) + " " + u[i];
};

const dl = (k: string) => "/api/download?key=" + encodeURIComponent(k);
const pv = (k: string) => "/api/download?inline=1&key=" + encodeURIComponent(k);

const IMG_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "svg"]);
const VID_EXT = new Set(["mp4", "webm", "ogv", "mov", "m4v"]);
const AUD_EXT = new Set(["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac"]);
const TXT_EXT = new Set(["txt", "md", "markdown", "csv", "json", "js", "jsx", "ts", "tsx", "css", "scss", "html", "htm", "xml", "yml", "yaml", "toml", "ini", "conf", "log", "sh", "bash", "sql", "py", "rb", "go", "rs", "java", "c", "h", "cpp", "env", "gitignore"]);
const kind = (n: string) => {
  const e = ext(n);
  if (IMG_EXT.has(e)) return "img";
  if (e === "pdf") return "pdf";
  if (VID_EXT.has(e)) return "vid";
  if (AUD_EXT.has(e)) return "aud";
  if (TXT_EXT.has(e)) return "txt";
  return "other";
};

const TEXT_PREVIEW_MAX = 1024 * 1024;

type FileInfo = { key: string; size: number; modified: string };
type DriveData = { folders: string[]; files: FileInfo[] };

function TextPreview({ file }: { file: FileInfo }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (file.size > TEXT_PREVIEW_MAX) return;
    let alive = true;
    fetch(pv(file.key))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Could not load preview."))))
      .then((t) => alive && setText(t))
      .catch((e: unknown) => alive && setErr(e instanceof Error ? e.message : String(e)));
    return () => { alive = false; };
  }, [file.key, file.size]);
  if (file.size > TEXT_PREVIEW_MAX)
    return <div className="pv-none">File is too large to preview. <a href={dl(file.key)}>Download</a></div>;
  return <pre className="pv-text">{err || text || "Loading…"}</pre>;
}

function PreviewBody({ file, name }: { file: FileInfo; name: string }) {
  const k = kind(file.key);
  const src = pv(file.key);
  if (k === "img") return <img src={src} alt={name} />;
  if (k === "vid") return <video src={src} controls autoPlay playsInline />;
  if (k === "aud") return <audio src={src} controls autoPlay />;
  if (k === "pdf") return <iframe src={src} title={name} />;
  if (k === "txt") return <TextPreview file={file} />;
  return <div className="pv-none">No preview for this file type.<br /><a href={dl(file.key)}>Download</a></div>;
}

export default function Home() {
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState<DriveData>({ folders: [], files: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [preview, setPreview] = useState<FileInfo | null>(null);
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setPreview(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [preview]);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/files?prefix=" + encodeURIComponent(prefix));
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not load files");
      setError("");
      setData(j);
    } catch (e) {
      setError((e instanceof Error ? e.message : String(e)) + ". Check your S3 settings in .env.local.");
    }
  }, [prefix]);
  useEffect(() => { load(); setQ(""); }, [load]);

  const loadUsage = useCallback(async () => {
    try {
      const r = await fetch("/api/usage");
      if (r.ok) setUsage(await r.json());
    } catch {}
  }, []);
  useEffect(() => { loadUsage(); }, [loadUsage]);

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setProgress(0);
    const fd = new FormData();
    fd.append("prefix", prefix);
    [...files].forEach((f) => fd.append("files", f));
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/files");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) return resolve();
          let msg = "Upload failed";
          try { msg = JSON.parse(xhr.responseText).error || msg; } catch {}
          reject(new Error(msg));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fd);
      });
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    setProgress(null);
    setBusy(false);
    load();
    loadUsage();
  }
  async function remove(key: string) {
    if (!confirm("Delete " + key.split("/").pop() + "?")) return;
    await fetch("/api/files?key=" + encodeURIComponent(key), { method: "DELETE" });
    load();
    loadUsage();
  }
  function newFolder() {
    setMenu(false);
    const n = (prompt("Folder name") || "").replace(/\//g, "").trim();
    if (n) setPrefix(prefix + n + "/");
  }

  const parts = prefix.split("/").filter(Boolean);
  const label = (p: string) => p.slice(prefix.length).replace(/\/$/, "");
  const match = (p: string) => label(p).toLowerCase().includes(q.toLowerCase());
  const folders = data.folders.filter(match);
  const files = data.files.filter((f) => match(f.key));
  const empty = !folders.length && !files.length;
  const openKey = (e: ReactKeyboardEvent, f: FileInfo) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPreview(f); }
  };
  const used = usage ? Math.min(usage.used, usage.limit) : 0;
  const free = usage ? Math.max(0, usage.limit - usage.used) : 0;
  const pct = usage && usage.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  const Actions = ({ k }: { k: string }) => (
    <span className="acts" onClick={(e) => e.stopPropagation()}>
      <a href={dl(k)} title="Download" aria-label="Download"><Icon d={P.down} s={20} /></a>
      <button title="Delete" aria-label="Delete" onClick={() => remove(k)}><Icon d={P.trash} s={20} /></button>
    </span>
  );

  return (
    <div
      className="app"
      onClick={() => setMenu(false)}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { if (e.relatedTarget === null) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
    >
      {drag && <div className="drop">Drop files to upload to {parts.length ? parts[parts.length - 1] : "My Drive"}</div>}

      <header>
        <div className="logo"><Icon d={P.drive} color="var(--accent)" s={34} /><span>Garage Drive</span></div>
        <label className="search">
          <Icon d={P.search} s={22} />
          <input placeholder="Search in this folder" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button
          className="theme"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Icon d={theme === "dark" ? P.sun : P.moon} s={22} />
        </button>
      </header>

      <aside>
        <div className="newwrap" onClick={(e) => e.stopPropagation()}>
          <button className="new" disabled={busy} onClick={() => setMenu(!menu)}>
            <Icon d={P.plus} s={24} />{busy ? "Uploading…" : "New"}
          </button>
          {menu && (
            <div className="menu">
              <button onClick={newFolder}>New folder</button>
              <button onClick={() => { setMenu(false); input.current?.click(); }}>File upload</button>
            </div>
          )}
        </div>
        <button className={"nav" + (!prefix ? " on" : "")} onClick={() => setPrefix("")}>
          <Icon d={P.drive} s={20} />My Drive
        </button>
        <div className="storage" aria-label="Bucket storage">
          <div className="storage-head"><span>Storage</span><span>{usage ? Math.round(pct) + "%" : "…"}</span></div>
          <div className="meter"><span className={pct > 90 ? "full" : ""} style={{ width: pct + "%" }} /></div>
          <div className="storage-foot">
            {usage
              ? <><b>{size(free)}</b> free of {size(usage.limit)}<span className="used">{size(used)} used</span></>
              : "Checking storage…"}
          </div>
        </div>
      </aside>

      <input ref={input} type="file" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />

      <main>
        <div className="top">
          <nav className="crumbs">
            <button onClick={() => setPrefix("")}>My Drive</button>
            {parts.map((p, i) => (
              <span key={i}>›<button onClick={() => setPrefix(parts.slice(0, i + 1).join("/") + "/")}>{p}</button></span>
            ))}
          </nav>
          <div className="toggle">
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view"><Icon d={P.list} s={20} /></button>
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Icon d={P.grid} s={20} /></button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {empty && !error && <div className="empty">{q ? "No matches in this folder." : "This folder is empty. Drop files here or use New."}</div>}

        {view === "grid" ? (
          <>
            {!!folders.length && <h2>Folders</h2>}
            <div className="grid small">
              {folders.map((f) => (
                <button className="chip" key={f} onClick={() => setPrefix(f)}>
                  <Icon d={P.folder} color="var(--muted)" /><span>{label(f)}</span>
                </button>
              ))}
            </div>
            {!!files.length && <h2>Files</h2>}
            <div className="grid">
              {files.map((f) => (
                <div className="card" key={f.key} title={f.key} role="button" tabIndex={0}
                  onClick={() => setPreview(f)} onKeyDown={(e) => openKey(e, f)}>
                  <div className="thumb"><Icon d={P.file} color={fileColor(f.key)} s={56} /><Actions k={f.key} /></div>
                  <div className="cap"><Icon d={P.file} color={fileColor(f.key)} s={18} /><span>{label(f.key)}</span></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="table">
            <div className="tr th"><span>Name</span><span>Size</span><span>Modified</span><span /></div>
            {folders.map((f) => (
              <div className="tr" key={f}>
                <button className="nm" onClick={() => setPrefix(f)}><Icon d={P.folder} color="var(--muted)" s={22} />{label(f)}</button>
                <span className="m">–</span><span className="m">–</span><span />
              </div>
            ))}
            {files.map((f) => (
              <div className="tr" key={f.key}>
                <button className="nm" onClick={() => setPreview(f)}><Icon d={P.file} color={fileColor(f.key)} s={22} />{label(f.key)}</button>
                <span className="m">{size(f.size)}</span>
                <span className="m">{new Date(f.modified).toLocaleDateString()}</span>
                <Actions k={f.key} />
              </div>
            ))}
          </div>
        )}
      </main>

      {busy && (
        <div className="uploading" role="status" aria-live="polite">
          <div className="up-head">
            <Icon d={P.plus} s={18} />
            {progress === 100 ? "Parking it" : "Uploading"}
            <span className="up-pct">{progress ?? 0}%</span>
          </div>
          <div className="upbar"><span style={{ width: Math.max(progress ?? 0, 6) + "%" }} /></div>
          <div className="up-note">Dropping into {parts.length ? parts[parts.length - 1] : "My Drive"}</div>
        </div>
      )}

      {preview && (
        <div className="preview" onClick={() => setPreview(null)}>
          <div className="pv" role="dialog" aria-modal="true" aria-label={label(preview.key)} onClick={(e) => e.stopPropagation()}>
            <div className="pv-top">
              <Icon d={P.file} color={fileColor(preview.key)} s={20} />
              <span className="name">{label(preview.key)}</span>
              <a href={dl(preview.key)} title="Download" aria-label="Download"><Icon d={P.down} s={20} /></a>
              <button onClick={() => setPreview(null)} title="Close" aria-label="Close"><Icon d={P.close} s={22} /></button>
            </div>
            <div className="pv-body"><PreviewBody file={preview} name={label(preview.key)} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
