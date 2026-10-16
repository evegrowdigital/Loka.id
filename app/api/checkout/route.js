import { admin, createInvoice, siteUrl, xenditReady } from "@/lib/server";

export const dynamic = "force-dynamic";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  try {
    if (!xenditReady()) return Response.json({ error: "Pembayaran belum dikonfigurasi oleh pemilik platform." }, { status: 503 });
    const { productId, name, email } = await req.json();
    if (!productId || !name?.trim() || !EMAIL.test(email || "")) return Response.json({ error: "Nama atau email belum benar." }, { status: 400 });

    const db = admin();
    const { data: prod } = await db.from("products").select("id, seller_id, name, price, active").eq("id", productId).maybeSingle();
    if (!prod || !prod.active) return Response.json({ error: "Produk tidak tersedia." }, { status: 404 });
    const { data: seller } = await db.from("profiles").select("suspended").eq("id", prod.seller_id).single();
    if (seller?.suspended) return Response.json({ error: "Toko ini sedang tidak aktif." }, { status: 404 });

    // Harga selalu diambil dari database, bukan dari browser
    const { data: order, error } = await db.from("orders").insert({
      seller_id: prod.seller_id, product_id: prod.id, product_name: prod.name,
      buyer_name: name.trim().slice(0, 80), buyer_email: email.trim().toLowerCase(), amount: prod.price,
    }).select("id, access_token").single();
    if (error) throw error;

    const site = siteUrl(req);
    const back = `${site}/pesanan/${order.id}?t=${order.access_token}`;
    try {
      const inv = await createInvoice({
        external_id: order.id, amount: prod.price, currency: "IDR", payer_email: email.trim(),
        description: prod.name, invoice_duration: 86400, success_redirect_url: back, failure_redirect_url: back,
      });
      await db.from("orders").update({ invoice_id: inv.id }).eq("id", order.id);
      return Response.json({ invoiceUrl: inv.invoice_url, orderId: order.id });
    } catch (e) {
      await db.from("orders").update({ status: "expired" }).eq("id", order.id);
      throw e;
    }
  } catch (e) {
    return Response.json({ error: e.message || "Terjadi kesalahan." }, { status: 500 });
  }
}
