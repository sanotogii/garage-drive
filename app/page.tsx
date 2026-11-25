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
  copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  external: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
  info: "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
};
const Icon = ({ d, color, s = 24 }: { d: string; color?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={color || "currentColor"} aria-hidden="true"><path d={d} /></svg>
);

const COLORS: Record<string, string> = { img: "#1d8102", pdf: "#d13212", doc: "#0972d3", vid: "#d13212", zip: "#5f6b7a" };
const EXT: Record<string, string> = {
  png: "img", jpg: "img", jpeg: "img", gif: "img", webp: "img", svg: "img",
  pdf: "pdf", doc: "doc", docx: "doc", txt: "doc", md: "doc", odt: "doc", xls: "doc", xlsx: "doc", csv: "doc", ppt: "doc", pptx: "doc",
  mp4: "vid", mkv: "vid", mov: "vid", mp3: "vid", zip: "zip", gz: "zip", tar: "zip", rar: "zip", "7z": "zip",
};
const ext = (n: string) => n.split(".").pop()!.toLowerCase();
const fileColor = (n: string) => COLORS[EXT[ext(n)]] || "#5f6b7a";

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
type ObjInfo = {
  key: string;
  size: number;
  modified: string;
  contentType: string;
  etag: string;
  public: boolean;
  bucket: string;
};

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

const PAGE_SIZE = 50;

export default function Home() {
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState<DriveData>({ folders: [], files: [] });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [bucket, setBucket] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [selected, setSelected] = useState<FileInfo | null>(null);
  const [info, setInfo] = useState<ObjInfo | null>(null);
  const [infoErr, setInfoErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ prefix, limit: String(PAGE_SIZE) });
      if (cursor) qs.set("cursor", cursor);
      const r = await fetch("/api/files?" + qs);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not load files");
      setError("");
      setData({ folders: j.folders || [], files: j.files || [] });
      setNextCursor(j.nextCursor ?? null);
      if (j.bucket) setBucket(j.bucket);
    } catch (e) {
      setError((e instanceof Error ? e.message : String(e)) + ". Check your S3 settings in .env.local.");
    }
  }, [prefix, cursor]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQ(""); }, [prefix]);

  const loadUsage = useCallback(async () => {
    try {
      const r = await fetch("/api/usage");
      if (r.ok) setUsage(await r.json());
    } catch {}
  }, []);
  useEffect(() => { loadUsage(); }, [loadUsage]);

  useEffect(() => {
    if (!selected) { setInfo(null); setInfoErr(""); return; }
    setInfo(null);
    setInfoErr("");
    let alive = true;
    fetch("/api/files?key=" + encodeURIComponent(selected.key))
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Could not load object details");
        return j;
      })
      .then((j) => alive && setInfo(j))
      .catch((e: unknown) => alive && setInfoErr(e instanceof Error ? e.message : String(e)));
    return () => { alive = false; };
  }, [selected]);

  function openPrefix(p: string) {
    setSelected(null);
    setPrefix(p);
    setCursor("");
    setCursorStack([]);
  }
  function openFile(f: FileInfo) {
    setSelected(f);
  }

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
    if (selected?.key === key) setSelected(null);
    load();
    loadUsage();
  }
  function newFolder() {
    setMenu(false);
    const n = (prompt("Folder name") || "").replace(/\//g, "").trim();
    if (n) openPrefix(prefix + n + "/");
  }

  async function togglePublic() {
    if (!selected || !info || saving) return;
    setSaving(true);
    setInfoErr("");
    try {
      const r = await fetch("/api/files?key=" + encodeURIComponent(selected.key), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: !info.public }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not change visibility");
      setInfo({ ...info, public: j.public });
    } catch (e) {
      setInfoErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setInfoErr("Could not copy to clipboard.");
    }
  }

  const parts = prefix.split("/").filter(Boolean);
  const label = (p: string) => p.slice(prefix.length).replace(/\/$/, "");
  const match = (p: string) => label(p).toLowerCase().includes(q.toLowerCase());
  const folders = data.folders.filter(match);
  const files = data.files.filter((f) => match(f.key));
  const empty = !folders.length && !files.length;
  const openKey = (e: ReactKeyboardEvent, f: FileInfo) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFile(f); }
  };
  const used = usage ? Math.min(usage.used, usage.limit) : 0;
  const free = usage ? Math.max(0, usage.limit - usage.used) : 0;
  const pct = usage && usage.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  const page = cursorStack.length + 1;
  const total = folders.length + files.length;
  function prevPage() {
    const s = [...cursorStack];
    const c = s.pop() ?? "";
    setCursorStack(s);
    setCursor(c);
  }
  function nextPage() {
    if (!nextCursor) return;
    setCursorStack([...cursorStack, cursor]);
    setCursor(nextCursor);
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const linkFor = (k: string) => `${origin}/api/download?inline=1&key=${encodeURIComponent(k)}`;
  const s3uri = (k: string) => `s3://${info?.bucket || bucket}/${k}`;

  const Actions = ({ k }: { k: string }) => (
    <span className="acts" onClick={(e) => e.stopPropagation()}>
      <a href={dl(k)} title="Download" aria-label="Download"><Icon d={P.down} s={18} /></a>
      <button title="Delete" aria-label="Delete" onClick={() => remove(k)}><Icon d={P.trash} s={18} /></button>
    </span>
  );

  const name = selected ? label(selected.key) : "";
  const isPublic = info?.public ?? false;

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
        <div className="logo"><span className="aws">aws</span><span className="svc">Garage Drive</span></div>
        <label className="search">
          <Icon d={P.search} s={20} />
          <input placeholder="Find objects by prefix" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="head-right">
          <span className="region">{bucket || "garage"}</span>
          <button
            className="theme"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Icon d={theme === "dark" ? P.sun : P.moon} s={20} />
          </button>
        </div>
      </header>

      <aside>
        <div className="newwrap" onClick={(e) => e.stopPropagation()}>
          <button className="new" disabled={busy} onClick={() => setMenu(!menu)}>
            <Icon d={P.plus} s={20} />{busy ? "Uploading…" : "Upload"}
          </button>
          {menu && (
            <div className="menu">
              <button onClick={newFolder}>Create folder</button>
              <button onClick={() => { setMenu(false); input.current?.click(); }}>Upload files</button>
            </div>
          )}
        </div>
        <p className="side-title">Buckets</p>
        <button className={"nav" + (!prefix && !selected ? " on" : "")} onClick={() => openPrefix("")}>
          <Icon d={P.drive} s={18} />My Drive
        </button>
        <div className="storage" aria-label="Bucket storage">
          <div className="storage-head"><span>Bucket quota</span><span>{usage ? Math.round(pct) + "%" : "…"}</span></div>
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
            <button onClick={() => openPrefix("")}>My Drive</button>
            {parts.map((p, i) => (
              <span key={i}>›<button onClick={() => openPrefix(parts.slice(0, i + 1).join("/") + "/")}>{p}</button></span>
            ))}
            {selected && <span>›<b className="cur">{name}</b></span>}
          </nav>
          {!selected && (
            <div className="toggle">
              <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view"><Icon d={P.list} s={18} /></button>
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Icon d={P.grid} s={18} /></button>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {selected ? (
          <div className="detail">
            <div className="obj-head">
              <button className="back" onClick={() => setSelected(null)} aria-label="Back to files"><Icon d={P.back} s={20} /></button>
              <div className="obj-title">
                <div className="obj-kind"><Icon d={P.file} color={fileColor(selected.key)} s={20} />Object</div>
                <h1>{name}</h1>
              </div>
              <div className="obj-actions">
                <a className="btn" href={dl(selected.key)}><Icon d={P.down} s={18} />Download</a>
                <button className="btn danger" onClick={() => remove(selected.key)}><Icon d={P.trash} s={18} />Delete</button>
              </div>
            </div>

            <div className="obj-grid">
              <section className="obj-preview">
                <div className="obj-preview-head">
                  <span>Preview</span>
                  <a href={linkFor(selected.key)} target="_blank" rel="noreferrer"><Icon d={P.external} s={16} />Open</a>
                </div>
                <div className="pv-body"><PreviewBody file={selected} name={name} /></div>
              </section>

              <aside className="obj-side">
                <h3>Object overview</h3>
                {infoErr && <p className="error small">{infoErr}</p>}
                <dl className="kv">
                  <dt>Key</dt><dd className="mono wrap">{selected.key}</dd>
                  <dt>Size</dt><dd className="mono">{size(info?.size ?? selected.size)}</dd>
                  <dt>Type</dt><dd className="mono">{info?.contentType ?? "…"}</dd>
                  <dt>Last modified</dt><dd className="mono">{new Date(info?.modified ?? selected.modified).toLocaleString()}</dd>
                  <dt>ETag</dt><dd className="mono wrap">{info?.etag || "…"}</dd>
                </dl>

                <h3>Permissions</h3>
                <div className="perm">
                  <div className="perm-state">
                    <span className={"perm-icon" + (isPublic ? " pub" : "")}>
                      <Icon d={isPublic ? P.globe : P.lock} s={18} />
                    </span>
                    <div>
                      <b>{isPublic ? "Public" : "Private"}</b>
                      <p>{isPublic ? "Anyone with the link can view this object." : "Only people with the app password can access it."}</p>
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={isPublic}
                    aria-label="Toggle public access"
                    className={"switch" + (isPublic ? " on" : "")}
                    onClick={togglePublic}
                    disabled={!info || saving}
                  >
                    <span />
                  </button>
                </div>

                <h3>Object URL</h3>
                <div className="linkrow">
                  <input readOnly value={linkFor(selected.key)} onFocus={(e) => e.target.select()} />
                  <button onClick={() => copy(linkFor(selected.key), "url")} title="Copy link" aria-label="Copy link">
                    <Icon d={copied === "url" ? P.check : P.copy} s={18} />
                  </button>
                </div>
                <p className="hint">
                  {isPublic
                    ? "Share this link. It works without the app password."
                    : "This link needs the app password until the object is made public."}
                </p>

                <h3>S3 URI</h3>
                <div className="linkrow">
                  <input readOnly value={s3uri(selected.key)} onFocus={(e) => e.target.select()} />
                  <button onClick={() => copy(s3uri(selected.key), "s3")} title="Copy S3 URI" aria-label="Copy S3 URI">
                    <Icon d={copied === "s3" ? P.check : P.copy} s={18} />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <>
            {empty && !error && <div className="empty">{q ? "No matches on this page." : "This folder is empty. Drop files here or use Upload."}</div>}

            {view === "grid" ? (
              <>
                {!!folders.length && <h2>Folders</h2>}
                <div className="grid small">
                  {folders.map((f) => (
                    <button className="chip" key={f} onClick={() => openPrefix(f)}>
                      <Icon d={P.folder} color="var(--aws-blue)" s={22} /><span>{label(f)}</span>
                    </button>
                  ))}
                </div>
                {!!files.length && <h2>Objects</h2>}
                <div className="grid">
                  {files.map((f) => (
                    <div className="card" key={f.key} title={f.key} role="button" tabIndex={0}
                      onClick={() => openFile(f)} onKeyDown={(e) => openKey(e, f)}>
                      <div className="thumb"><Icon d={P.file} color={fileColor(f.key)} s={48} /><Actions k={f.key} /></div>
                      <div className="cap"><Icon d={P.file} color={fileColor(f.key)} s={16} /><span>{label(f.key)}</span></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="table">
                <div className="tr th"><span>Name</span><span>Size</span><span>Last modified</span><span /></div>
                {folders.map((f) => (
                  <div className="tr" key={f}>
                    <button className="nm" onClick={() => openPrefix(f)}><Icon d={P.folder} color="var(--aws-blue)" s={20} />{label(f)}</button>
                    <span className="m">–</span><span className="m">–</span><span />
                  </div>
                ))}
                {files.map((f) => (
                  <div className="tr" key={f.key}>
                    <button className="nm" onClick={() => openFile(f)}><Icon d={P.file} color={fileColor(f.key)} s={20} />{label(f.key)}</button>
                    <span className="m">{size(f.size)}</span>
                    <span className="m">{new Date(f.modified).toLocaleDateString()}</span>
                    <Actions k={f.key} />
                  </div>
                ))}
              </div>
            )}

            {(total > 0 || page > 1 || nextCursor) && (
              <div className="pager">
                <span className="pager-info">
                  Page {page} · {total} {total === 1 ? "item" : "items"} this page
                </span>
                <div className="pager-btns">
                  <button disabled={page <= 1} onClick={prevPage}>Previous</button>
                  <button disabled={!nextCursor} onClick={nextPage}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {busy && (
        <div className="uploading" role="status" aria-live="polite">
          <div className="up-head">
            <Icon d={P.plus} s={18} />
            {progress === 100 ? "Finishing" : "Uploading"}
            <span className="up-pct">{progress ?? 0}%</span>
          </div>
          <div className="upbar"><span style={{ width: Math.max(progress ?? 0, 6) + "%" }} /></div>
          <div className="up-note">Uploading to {parts.length ? parts[parts.length - 1] : "My Drive"}</div>
        </div>
      )}
    </div>
  );
}
