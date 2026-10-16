"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import { rupiah, balanceFor, feeRate, fullDate, sb, accessToken } from "@/lib/db";

function View({ s }) {
  const { db, user, reload } = s;
  const bal = balanceFor(db, user.id);
  const rate = feeRate(db, user);
  const min = db.settings.minWithdraw;
  const [f, setF] = useState({ amount: "", bank: "", account: "", holder: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const amt = Number(f.amount) || 0;
  const fee = Math.round(amt * rate);
  const hist = db.withdrawals;

  const submit = async (e) => {
    e.preventDefault();
    if (amt < min) return setMsg({ bad: `Penarikan minimal ${rupiah(min)}.` });
    if (amt > bal.available) return setMsg({ bad: "Saldo tidak mencukupi." });
    setBusy(true); setMsg(null);
    // Perhitungan, pemeriksaan saldo, dan pencatatan dilakukan di server (fungsi database), bukan di browser
    const { error } = await sb().rpc("request_withdrawal", { p_amount: amt, p_bank: f.bank, p_account: f.account, p_holder: f.holder });
    setBusy(false);
    if (error) return setMsg({ bad: error.message });
    setF({ amount: "", bank: "", account: "", holder: "" });
    setMsg({ ok: "Permintaan penarikan dikirim dan sedang diproses." });
    reload();
  };

  const upgrade = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/pro/checkout", { method: "POST", headers: { Authorization: "Bearer " + (await accessToken()) } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      window.location.href = j.invoiceUrl;
    } catch (e) { setMsg({ bad: e.message || "Gagal membuat tagihan." }); setBusy(false); }
  };

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi hl"><div className="l">Saldo tersedia</div><div className="v">{rupiah(bal.available)}</div></div>
        <div className="kpi"><div className="l">Sedang diproses</div><div className="v">{rupiah(bal.processing)}</div></div>
        <div className="kpi"><div className="l">Total pendapatan</div><div className="v">{rupiah(bal.earned)}</div></div>
        <div className="kpi"><div className="l">Total biaya penarikan</div><div className="v">{rupiah(bal.feePaid)}</div></div>
        <div className="kpi"><div className="l">Dana tercairkan (bersih)</div><div className="v">{rupiah(bal.netPaid)}</div></div>
      </div>

      <div className="card">
        <div className="row between wrap"><h3>Tarik saldo</h3><span className={"badge " + (user.plan === "pro" ? "pro" : "")}>Paket {user.plan === "pro" ? "Pro" : "Free"} Âˇ biaya {+(rate * 100).toFixed(2)}%</span></div>
        <form onSubmit={submit}>
          <div className="grid2">
            <div className="field"><label htmlFor="wa">Nominal (Rp)</label><input id="wa" className="input" type="number" min={min} step="1000" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
            <div className="field"><label htmlFor="wb">Bank atau e-wallet</label><input id="wb" className="input" required placeholder="BCA, BRI, DANA, ..." value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
            <div className="field"><label htmlFor="wn">Nomor rekening</label><input id="wn" className="input" inputMode="numeric" required value={f.account} onChange={(e) => setF({ ...f, account: e.target.value.replace(/\D/g, "") })} /></div>
            <div className="field"><label htmlFor="wh">Nama pemilik rekening</label><input id="wh" className="input" required value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} /></div>
          </div>
          {amt > 0 && <div className="okmsg" style={{ marginTop: 14 }}>Biaya penarikan {+(rate * 100).toFixed(2)}%: <b>{rupiah(fee)}</b>. Dana yang kamu terima: <b>{rupiah(amt - fee)}</b>.</div>}
          {msg?.bad && <div className="err" style={{ marginTop: 14 }} role="alert">{msg.bad}</div>}
          {msg?.ok && <div className="okmsg" style={{ marginTop: 14 }} role="status">{msg.ok}</div>}
          <div className="row wrap" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" disabled={busy}>Ajukan penarikan</button>
            {user.plan !== "pro" && <button type="button" className="btn btn-ghost" disabled={busy} onClick={upgrade}>Upgrade ke Pro ({rupiah(db.settings.proPrice)}/30 hari)</button>}
          </div>
          {user.plan === "pro" && user.planExpiresAt && <p className="hint">Pro aktif sampai {new Date(user.planExpiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.</p>}
          <p className="hint">Penarikan minimal {rupiah(min)}. Biaya ini adalah biaya layanan pencairan LOKA. Dana ditransfer setelah admin memverifikasi permintaanmu.</p>
        </form>
      </div>

      <div className="card tablewrap">
        <h3>Riwayat penarikan</h3>
        {hist.length === 0 ? <div className="empty">Belum ada penarikan.</div> : (
          <table>
            <thead><tr><th>Tanggal</th><th>Nominal</th><th>Biaya</th><th>Diterima</th><th>Rekening</th><th>Status</th></tr></thead>
            <tbody>{hist.map((w) => <tr key={w.id}><td>{fullDate(w.createdAt)}</td><td>{rupiah(w.amount)}</td><td>{rupiah(w.fee)}</td><td><b>{rupiah(w.net)}</b></td><td>{w.bank} {w.account}</td><td><span className={"badge " + (w.status === "berhasil" ? "ok" : w.status === "ditolak" ? "bad" : "wait")}>{w.status}</span></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default function Saldo() { return <DashShell title="Saldo" subtitle="Kelola penghasilan dan penarikan dana.">{(s) => <View s={s} />}</DashShell>; }
