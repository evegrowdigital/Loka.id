import { admin, siteUrl } from "@/lib/server";
import { emailReady, sendBuyerReceipt } from "@/lib/email";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Pembeli meminta kirim ulang email bukti (jeda minimal 60 detik)
export async function POST(req, { params }) {
  try {
    const token = new URL(req.url).searchParams.get("token") || "";
    if (!UUID.test(token)) return Response.json({ error: "Link tidak valid." }, { status: 400 });
    if (!emailReady()) return Response.json({ error: "Pengiriman email belum diaktifkan." }, { status: 503 });
    const db = admin();
    const { data: o } = await db.from("orders").select("id, status").eq("id", params.id).eq("access_token", token).maybeSingle();
    if (!o || o.status !== "paid") return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    const r = await sendBuyerReceipt(db, o.id, siteUrl(req), { resend: true });
    if (r === "sent") return Response.json({ ok: true });
    if (r === "skipped") return Response.json({ error: "Tunggu sebentar sebelum meminta kirim ulang." }, { status: 429 });
    return Response.json({ error: "Email gagal dikirim. Coba lagi nanti." }, { status: 502 });
  } catch (e) {
    return Response.json({ error: e.message || "Terjadi kesalahan." }, { status: 500 });
  }
}
