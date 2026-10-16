"use client";
import DashShell from "@/components/DashShell";
import { rupiah, fullDate } from "@/lib/db";

export default function Pesanan() {
  return (
    <DashShell title="Pesanan" subtitle="Semua transaksi dari tokomu.">
      {({ db, user }) => {
        const list = db.orders.filter((o) => o.sellerId === user.id).sort((a, b) => b.createdAt - a.createdAt);
        return (
          <div className="card tablewrap">
            {list.length === 0 ? <div className="empty">Belum ada pesanan.</div> : (
              <table>
                <thead><tr><th>No. pesanan</th><th>Produk</th><th>Pembeli</th><th>Tanggal</th><th>Jumlah</th><th>Status</th></tr></thead>
                <tbody>{list.map((o) => (
                  <tr key={o.id}><td>{o.id}</td><td>{o.productName}</td><td>{o.buyerName}<div className="small muted">{o.buyerEmail}</div></td><td>{fullDate(o.createdAt)}</td><td><b>{rupiah(o.amount)}</b></td><td><span className={"badge " + (o.status === "paid" ? "ok" : o.status === "expired" ? "bad" : "wait")}>{o.status === "paid" ? "Dibayar" : o.status === "expired" ? "Kedaluwarsa" : "Menunggu"}</span></td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
        );
      }}
    </DashShell>
  );
}
