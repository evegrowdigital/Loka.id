"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import { THEMES, RESERVED, uid, sb } from "@/lib/db";

function Form({ s }) {
  const { store, reload } = s;
  const [f, setF] = useState({ ...store, socials: { instagram: "", tiktok: "", whatsapp: "", ...store.socials } });
  const [msg, setMsg] = useState(null);
  const [nl, setNl] = useState({ title: "", url: "" });

  const save = async (e) => {
    e.preventDefault();
    const un = f.username.trim().toLowerCase();
    if (un.length < 3) return setMsg({ bad: "Username minimal 3 karakter." });
    if (RESERVED.includes(un)) return setMsg({ bad: "Username tidak tersedia." });
    const { error } = await sb().from("stores").update({ username: un, name: f.name.trim(), bio: f.bio, color: f.color, socials: f.socials, links: f.links || [] }).eq("user_id", store.userId);
    if (error) return setMsg({ bad: error.code === "23505" ? "Username sudah dipakai." : error.code === "23514" ? "Username hanya boleh huruf kecil, angka, titik, dan garis bawah (3-30 karakter)." : error.message });
    setMsg({ ok: "Perubahan tersimpan." });
    reload();
  };
  const addLink = () => {
    if (!nl.title || !nl.url) return;
    setF({ ...f, links: [...(f.links || []), { id: uid("l"), ...nl }] }); setNl({ title: "", url: "" });
  };

  return (
    <form className="stack" onSubmit={save}>
      <div className="card">
        <h3>Profil toko</h3>
        <div className="field"><label htmlFor="sn">Nama toko</label><input id="sn" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="su">Username</label><input id="su" className="input" required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })} /><div className="hint">Link toko: /{f.username}</div></div>
        <div className="field"><label htmlFor="sb">Deskripsi</label><textarea id="sb" className="input" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
        <div className="field"><label>Warna toko</label>
          <div className="chips">{Object.entries(THEMES).map(([n, c]) => (
            <button type="button" key={n} className={"chip" + (f.color === c ? " on" : "")} onClick={() => setF({ ...f, color: c })}><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 9, background: c, marginRight: 6, verticalAlign: "-1px" }} />{n}</button>
          ))}</div></div>
      </div>
      <div className="card">
        <h3>Media sosial</h3>
        {["instagram", "tiktok", "whatsapp"].map((k) => (
          <div className="field" key={k}><label htmlFor={"so" + k} style={{ textTransform: "capitalize" }}>{k}</label><input id={"so" + k} className="input" type="url" placeholder="https://" value={f.socials[k]} onChange={(e) => setF({ ...f, socials: { ...f.socials, [k]: e.target.value } })} /></div>
        ))}
      </div>
      <div className="card">
        <h3>Tautan tambahan</h3>
        {(f.links || []).map((l) => <div className="listrow" key={l.id}><div><b>{l.title}</b><div className="small muted">{l.url}</div></div><button type="button" className="btn btn-danger btn-sm" onClick={() => setF({ ...f, links: f.links.filter((x) => x.id !== l.id) })}>Hapus</button></div>)}
        <div className="grid2" style={{ marginTop: 12 }}>
          <input className="input" placeholder="Judul tautan" aria-label="Judul tautan" value={nl.title} onChange={(e) => setNl({ ...nl, title: e.target.value })} />
          <input className="input" type="url" placeholder="https://" aria-label="URL tautan" value={nl.url} onChange={(e) => setNl({ ...nl, url: e.target.value })} />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addLink}>Tambah tautan</button>
      </div>
      {msg?.bad && <div className="err" role="alert">{msg.bad}</div>}
      {msg?.ok && <div className="okmsg" role="status">{msg.ok}</div>}
      <button className="btn btn-primary">Simpan perubahan</button>
    </form>
  );
}

export default function Toko() {
  return <DashShell title="Toko" subtitle="Atur tampilan dan informasi tokomu.">{(s) => <Form s={s} />}</DashShell>;
}
