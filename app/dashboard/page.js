"use client";
import Link from "next/link";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import BarChart from "@/components/BarChart";
import { rupiah, balanceFor, statsFor, fullDate } from "@/lib/db";

export default function Overview() {
  const [copied, setCopied] = useState(false);
  return (
    <DashShell title="Ringkasan" subtitle="Performa tokomu dalam 14 hari terakhir.">
      {({ db, user, store }) => {
        const now = Date.now();
        const st = statsFor(db, user.id, now - 13 * 86400000, now);
        const bal = balanceFor(db, user.id);
        const url = typeof window !== "undefined" ? `${window.location.origin}/${store.username}` : `/${store.username}`;
        const recent = db.orders.filter((o) => o.sellerId === user.id && o.status === "paid").sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        return (
          <div className="stack">
            <div className="card">
              <p className="small muted" style={{ marginBottom: 8 }}>Link tokomu</p>
              <div className="copybox">
                <span style={{ flex: 1 }}>{url}</span>
                <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Tersalin" : "Salin"}</button>
              </div>
              <div className="row wrap" style={{ marginTop: 12 }}>
                <Link className="btn btn-ghost btn-sm" href={`/${store.username}`}>Lihat toko</Link>
                <Link className="btn btn-ghost btn-sm" href="/dashboard/produk">Tambah produk</Link>
              </div>
            </div>
            <div className="kpis">
              <div className="kpi hl"><div className="l">Saldo tersedia</div><div className="v">{rupiah(bal.available)}</div></div>
              <div className="kpi"><div className="l">Omzet 14 hari</div><div className="v">{rupiah(st.revenue)}</div></div>
              <div className="kpi"><div className="l">Pesanan</div><div className="v">{st.orders}</div></div>
              <div className="kpi"><div className="l">Pengunjung</div><div className="v">{st.visitors}</div></div>
            </div>
            <div className="card"><h3>Omzet harian</h3><BarChart data={st.series} format={rupiah} label="Omzet harian" /></div>
            <div className="card">
              <h3>Pesanan terbaru</h3>
              {recent.length === 0 ? <div className="empty">Belum ada pesanan. Bagikan link tokomu untuk mulai menerima pesanan.</div> :
                recent.map((o) => <div className="listrow" key={o.id}><div><b>{o.productName}</b><div className="small muted">{o.buyerName} · {fullDate(o.createdAt)}</div></div><b>{rupiah(o.amount)}</b></div>)}
            </div>
          </div>
        );
      }}
    </DashShell>
  );
}
