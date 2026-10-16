"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import BarChart from "@/components/BarChart";
import { rupiah, statsFor, inputDate } from "@/lib/db";

function View({ s }) {
  const [days, setDays] = useState(14);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [metric, setMetric] = useState("value");
  const now = Date.now();
  let a = now - (days - 1) * 86400000, b = now;
  if (days === 0 && from && to) { a = new Date(from + "T00:00:00").getTime(); b = new Date(to + "T23:59:59").getTime(); }
  const st = statsFor(s.db, s.user.id, a, b);
  const data = st.series.map((x) => ({ label: x.label, value: x[metric] }));
  const maxSrc = Math.max(1, ...st.sources.map((x) => x[1]));
  const maxSold = Math.max(1, ...st.top.map((x) => x.sold));
  return (
    <div className="stack">
      <div className="card">
        <p className="small muted" style={{ marginBottom: 8 }}>Periode</p>
        <div className="chips">
          {[[7, "7 hari"], [14, "14 hari"], [30, "30 hari"], [0, "Pilih tanggal"]].map(([v, l]) => <button key={v} className={"chip" + (days === v ? " on" : "")} onClick={() => { setDays(v); if (v === 0 && !from) { setFrom(inputDate(now - 6 * 86400000)); setTo(inputDate(now)); } }}>{l}</button>)}
        </div>
        {days === 0 && <div className="grid2" style={{ marginTop: 12 }}>
          <div><label htmlFor="df">Dari</label><input id="df" className="input" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label htmlFor="dt">Sampai</label><input id="dt" className="input" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        </div>}
      </div>
      <div className="kpis">
        <div className="kpi hl"><div className="l">Total omzet</div><div className="v">{rupiah(st.revenue)}</div></div>
        <div className="kpi"><div className="l">Pendapatan bersih</div><div className="v">{rupiah(st.net)}</div><div className="small muted">setelah biaya penarikan</div></div>
        <div className="kpi"><div className="l">Transaksi berhasil</div><div className="v">{st.orders}</div></div>
        <div className="kpi"><div className="l">Rata-rata transaksi</div><div className="v">{rupiah(st.avg)}</div></div>
        <div className="kpi"><div className="l">Pengunjung toko</div><div className="v">{st.visitors}</div></div>
        <div className="kpi"><div className="l">Kunjungan produk</div><div className="v">{st.productViews}</div></div>
        <div className="kpi"><div className="l">Konversi</div><div className="v">{st.conversion.toFixed(1)}%</div></div>
      </div>
      <div className="card">
        <div className="row between wrap"><h3>Grafik perkembangan</h3>
          <div className="chips">{[["value", "Omzet"], ["orders", "Transaksi"], ["visits", "Kunjungan"]].map(([k, l]) => <button key={k} className={"chip" + (metric === k ? " on" : "")} onClick={() => setMetric(k)}>{l}</button>)}</div></div>
        <BarChart data={data} format={metric === "value" ? rupiah : (v) => v} label="Grafik perkembangan" />
      </div>
      <div className="grid2">
        <div className="card"><h3>Produk terlaris</h3>
          {st.top.length === 0 ? <div className="empty">Belum ada produk.</div> : st.top.map((p) => (
            <div key={p.id} style={{ margin: "12px 0" }}><div className="row between"><span>{p.name}</span><b>{p.sold} terjual</b></div>
              <div className="bar-row"><div className="track"><div className="fill" style={{ width: (p.sold / maxSold) * 100 + "%" }} /></div></div>
              <div className="small muted">{rupiah(p.revenue)} Â· {p.views} kunjungan</div></div>
          ))}</div>
        <div className="card"><h3>Sumber pengunjung</h3>
          {st.sources.length === 0 ? <div className="empty">Belum ada data kunjungan.</div> : st.sources.map(([n, c]) => (
            <div className="bar-row" key={n}><span style={{ width: 86 }}>{n}</span><div className="track"><div className="fill" style={{ width: (c / maxSrc) * 100 + "%" }} /></div><b>{c}</b></div>
          ))}
          <p className="hint">Tambahkan ?ref=instagram di akhir link tokomu untuk melacak sumber.</p></div>
      </div>
    </div>
  );
}
export default function Statistik() { return <DashShell title="Statistik" subtitle="Pahami performa tokomu berdasarkan data nyata.">{(s) => <View s={s} />}</DashShell>; }
