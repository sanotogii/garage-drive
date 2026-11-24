"use client";
import { useEffect, useState, useCallback, useRef } from "react";

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
};
const Icon = ({ d, color, s = 24 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={color || "currentColor"} aria-hidden="true"><path d={d} /></svg>
);

const COLORS = { img: "#188038", pdf: "#d93025", doc: "#1a73e8", vid: "#d93025", zip: "#5f6368" };
const EXT = {
  png: "img", jpg: "img", jpeg: "img", gif: "img", webp: "img", svg: "img",
  pdf: "pdf", doc: "doc", docx: "doc", txt: "doc", md: "doc", odt: "doc", xls: "doc", xlsx: "doc", csv: "doc", ppt: "doc", pptx: "doc",
  mp4: "vid", mkv: "vid", mov: "vid", mp3: "vid", zip: "zip", gz: "zip", tar: "zip", rar: "zip", "7z": "zip",
};
const fileColor = (n) => COLORS[EXT[n.split(".").pop().toLowerCase()]] || "#5f6368";

const size = (n) => {
  if (n < 1024) return n + " B";
  const u = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < 3);
  return n.toFixed(1) + " " + u[i];
};

export default function Home() {
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState({ folders: [], files: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const input = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/files?prefix=" + encodeURIComponent(prefix));
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not load files");
      setError("");
      setData(j);
    } catch (e) {
      setError(e.message + ". Check your S3 settings in .env.local.");
    }
  }, [prefix]);
  useEffect(() => { load(); setQ(""); }, [load]);

  async function upload(files) {
    if (!files || !files.length) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("prefix", prefix);
    [...files].forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/files", { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).error || "Upload failed");
    } catch (e) { setError(e.message); }
    setBusy(false);
    load();
  }
  async function remove(key) {
    if (!confirm("Delete " + key.split("/").pop() + "?")) return;
    await fetch("/api/files?key=" + encodeURIComponent(key), { method: "DELETE" });
    load();
  }
  function newFolder() {
    setMenu(false);
    const n = (prompt("Folder name") || "").replace(/\//g, "").trim();
    if (n) setPrefix(prefix + n + "/");
  }

  const parts = prefix.split("/").filter(Boolean);
  const label = (p) => p.slice(prefix.length).replace(/\/$/, "");
  const match = (p) => label(p).toLowerCase().includes(q.toLowerCase());
  const folders = data.folders.filter(match);
  const files = data.files.filter((f) => match(f.key));
  const empty = !folders.length && !files.length;
  const dl = (k) => "/api/download?key=" + encodeURIComponent(k);

  const Actions = ({ k }) => (
    <span className="acts">
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
        <div className="logo"><Icon d={P.drive} color="#1a73e8" s={34} /><span>Garage Drive</span></div>
        <label className="search">
          <Icon d={P.search} s={22} />
          <input placeholder="Search in this folder" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </header>

      <aside>
        <div className="newwrap" onClick={(e) => e.stopPropagation()}>
          <button className="new" disabled={busy} onClick={() => setMenu(!menu)}>
            <Icon d={P.plus} s={24} />{busy ? "Uploading…" : "New"}
          </button>
          {menu && (
            <div className="menu">
              <button onClick={newFolder}>New folder</button>
              <button onClick={() => { setMenu(false); input.current.click(); }}>File upload</button>
            </div>
          )}
        </div>
        <button className={"nav" + (!prefix ? " on" : "")} onClick={() => setPrefix("")}>
          <Icon d={P.drive} s={20} />My Drive
        </button>
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
                  <Icon d={P.folder} color="#5f6368" /><span>{label(f)}</span>
                </button>
              ))}
            </div>
            {!!files.length && <h2>Files</h2>}
            <div className="grid">
              {files.map((f) => (
                <div className="card" key={f.key} title={f.key}>
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
                <button className="nm" onClick={() => setPrefix(f)}><Icon d={P.folder} color="#5f6368" s={22} />{label(f)}</button>
                <span className="m">–</span><span className="m">–</span><span />
              </div>
            ))}
            {files.map((f) => (
              <div className="tr" key={f.key}>
                <span className="nm"><Icon d={P.file} color={fileColor(f.key)} s={22} />{label(f.key)}</span>
                <span className="m">{size(f.size)}</span>
                <span className="m">{new Date(f.modified).toLocaleDateString()}</span>
                <Actions k={f.key} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
