"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { loadPublicStore, recordVisit, rupiah } from "@/lib/db";
import { Problem } from "@/components/DashShell";

const refParam = () => new URLSearchParams(window.location.search).get("ref") || "Langsung";

export default function StorePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [pick, setPick] = useState(null);

  useEffect(() => {
    let live = true;
    loadPublicStore(username).then((d) => {
      if (!live) return;
      setData(d);
      if (d.store) {
        const k = "loka_seen_" + d.store.userId;
        if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); recordVisit(d.store.userId, null, refParam()); }
      }
    });
    return () => { live = false; };
  }, [username]);

  if (!data) return <div className="storepage" />;
  if (data.error) return <Problem error={data.error} />;
  if (!data.store) {
    return (
      <div className="authwrap"><div className="authbox" style={{ textAlign: "center" }}>
        <h1>Toko tidak ditemukan</h1>
        <p className="muted" style={{ margin: "8px 0 18px" }}>Periksa kembali link tokonya, atau buat tokomu sendiri.</p>
        <Link href="/register" className="btn btn-primary">Buat toko gratis</Link>
      </div></div>
    );
  }

  const { store, products } = data;
  const soc = store.socials || {};
  const open = (p) => { recordVisit(store.userId, p.id, refParam()); setPick(p); };

  return (
    <div className="storepage" style={{ "--store": store.color }}>
      <div className="storebox">
        <div className="storehead">
          <div className="av">{store.name.charAt(0).toUpperCase()}</div>
          <h1>{store.name} {store.isPro && <span className="badge pro" style={{ verticalAlign: "middle" }}>Pro</span>}</h1>
          {store.bio && <p className="muted" style={{ marginTop: 6 }}>{store.bio}</p>}
          <div className="socials">
            {soc.instagram && <a href={soc.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {soc.tiktok && <a href={soc.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
            {soc.whatsapp && <a href={soc.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </div>
        {store.links.map((l) => <a key={l.id} className="sl" href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a>)}
        {products.length === 0 && <div className="card empty">Belum ada produk.</div>}
        {products.map((p) => (
          <button key={p.id} className="sp" onClick={() => open(p)}>
            <div className="th">{p.type.charAt(0)}</div>
            <div><div className="t">{p.name}</div><div className="small muted">{p.type}</div></div>
            <div className="pr">{rupiah(p.price)}</div>
          </button>
        ))}
        <div className="poweredby">Dibuat dengan <Link href="/" style={{ fontWeight: 700, color: "var(--blue-d)" }}>LOKA</Link></div>
      </div>
      {pick && <Checkout product={pick} onClose={() => setPick(null)} />}
    </div>
  );
}

function Checkout({ product, onClose }) {
  const [f, setF] = useState({ name: "", email: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pay = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, name: f.name, email: f.email }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Gagal membuat pembayaran.");
      window.location.href = j.invoiceUrl; // halaman pembayaran Xendit (QRIS, VA, e-wallet, dll)
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <div className="modalbg" onClick={onClose} role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={pay}>
          <div className="row between"><h2 style={{ fontSize: 24 }}>Checkout</h2><button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button></div>
          <div className="card" style={{ margin: "16px 0", background: "var(--mist)" }}>
            <b>{product.name}</b><p className="small muted">{product.description}</p>
            <div style={{ font: "700 22px var(--fd)", marginTop: 6 }}>{rupiah(product.price)}</div>
          </div>
          <div className="field"><label htmlFor="bn">Nama</label><input id="bn" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="be">Email</label><input id="be" className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /><div className="hint">Bukti pembayaran dikirim ke email ini.</div></div>
          {err && <div className="err" style={{ marginTop: 14 }} role="alert">{err}</div>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={busy}>{busy ? "Mengalihkan…" : `Bayar ${rupiah(product.price)}`}</button>
          <p className="hint" style={{ textAlign: "center" }}>Kamu akan diarahkan ke halaman pembayaran yang aman.</p>
        </form>
      </div>
    </div>
  );
}
