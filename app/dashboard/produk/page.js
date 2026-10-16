"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import { rupiah, sb, PRODUCT_TYPES } from "@/lib/db";

const BLANK = { name: "", type: "E-book", description: "", price: "", fileUrl: "", active: true };

function View({ s }) {
  const { db, user, reload } = s;
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const list = db.products;

  const save = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!(price >= 1000)) return setErr("Harga minimal Rp1.000.");
    setErr(""); setBusy(true);
    try {
      const c = sb();
      let fileUrl = form.fileUrl.trim();
      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error("Ukuran file maksimal 50 MB.");
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        fileUrl = `${user.id}/${Date.now()}-${safe}`;
        const up = await c.storage.from("product-files").upload(fileUrl, file);
        if (up.error) throw up.error;
      }
      if (!fileUrl) throw new Error("Isi tautan produk atau unggah file.");
      const row = { name: form.name.trim(), type: form.type, description: form.description, price, active: form.active };
      let pid = form.id;
      if (pid) { const { error } = await c.from("products").update(row).eq("id", pid); if (error) throw error; }
      else { const { data, error } = await c.from("products").insert({ ...row, seller_id: user.id }).select("id").single(); if (error) throw error; pid = data.id; }
      const { error: fe } = await c.from("product_files").upsert({ product_id: pid, file_url: fileUrl });
      if (fe) throw fe;
      setForm(null); setFile(null); await reload();
    } catch (e2) { setErr(e2.message || "Gagal menyimpan."); }
    setBusy(false);
  };

  const toggle = async (p) => { await sb().from("products").update({ active: !p.active }).eq("id", p.id); reload(); };
  const remove = async (p) => {
    if (!confirm("Hapus produk ini?")) return;
    const { error } = await sb().from("products").delete().eq("id", p.id);
    if (error) alert(/foreign key|violates/i.test(error.message) ? "Produk ini sudah pernah dipesan, jadi tidak bisa dihapus. Pilih Sembunyikan saja." : error.message);
    reload();
  };

  return (
    <div className="stack">
      <div><button className="btn btn-primary btn-sm" onClick={() => { setErr(""); setFile(null); setForm({ ...BLANK }); }}>Tambah produk</button></div>
      {form && (
        <form className="card" onSubmit={save}>
          <h3>{form.id ? "Ubah produk" : "Produk baru"}</h3>
          <div className="field"><label htmlFor="pn">Nama produk</label><input id="pn" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="pt">Jenis</label><select id="pt" className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="pp">Harga (Rp)</label><input id="pp" className="input" type="number" min="1000" step="1000" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="pd">Deskripsi</label><textarea id="pd" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label htmlFor="pf">Tautan produk</label><input id="pf" className="input" placeholder="https:// (Google Drive, Notion, kelas, dll)" value={/^https?:/i.test(form.fileUrl) ? form.fileUrl : ""} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></div>
          <div className="field"><label htmlFor="pu">Atau unggah file</label><input id="pu" className="input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="hint">{form.fileUrl && !/^https?:/i.test(form.fileUrl) && !file ? "File sudah tersimpan. Pilih file baru hanya jika ingin menggantinya. " : ""}Maksimal 50 MB. File disimpan privat dan hanya dikirim ke pembeli yang sudah membayar.</div></div>
          {err && <div className="err" style={{ marginTop: 12 }} role="alert">{err}</div>}
          <div className="row" style={{ marginTop: 16 }}><button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpanâ¦" : "Simpan produk"}</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Batal</button></div>
        </form>
      )}
      <div className="card">
        {list.length === 0 ? <div className="empty">Belum ada produk. Tambahkan produk pertamamu.</div> : list.map((p) => (
          <div className="listrow wrap" key={p.id}>
            <div style={{ flex: 1, minWidth: 180 }}><b>{p.name}</b> {!p.active && <span className="badge wait">Disembunyikan</span>}<div className="small muted">{p.type} Â· {rupiah(p.price)}</div></div>
            <div className="row wrap">
              <button className="btn btn-ghost btn-sm" onClick={() => { setErr(""); setFile(null); setForm({ ...p }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Ubah</button>
              <button className="btn btn-ghost btn-sm" onClick={() => toggle(p)}>{p.active ? "Sembunyikan" : "Tampilkan"}</button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function Produk() { return <DashShell title="Produk" subtitle="Kelola produk yang dijual di tokomu.">{(s) => <View s={s} />}</DashShell>; }
