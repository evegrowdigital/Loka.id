import Link from "next/link";
import Logo from "@/components/Logo";
import FeeCalc from "@/components/FeeCalc";

const STEPS = [
  ["Daftar", "Buat akun dengan email, lalu masuk ke dashboard pribadimu."],
  ["Buat toko", "Atur nama, username, foto, deskripsi, dan warna toko."],
  ["Tambah produk", "Unggah e-book, template, kelas, atau jasa dengan harga sendiri."],
  ["Bagikan tautan", "Pasang link tokomu di Instagram, TikTok, atau WhatsApp."],
];
const FEATS = [
  ["Toko dengan link unik", "Setiap kreator punya alamat toko sendiri, misalnya loka.id/namamu. Pembeli tidak perlu membuat akun."],
  ["Pengiriman otomatis", "Setelah pembayaran terverifikasi, pembeli langsung menerima tautan atau file produk."],
  ["Saldo dan penarikan", "Pantau saldo tersedia, ajukan penarikan, dan lihat riwayat lengkap dengan status."],
  ["Statistik penjualan", "Omzet, pengunjung, produk terlaris, sumber trafik, dan tingkat konversi dalam satu halaman."],
  ["Data terpisah per toko", "Setiap kreator hanya bisa melihat produk, pesanan, dan laporan miliknya sendiri."],
];

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="container">
          <Logo />
          <nav className="navlinks" aria-label="Navigasi"><a href="#cara">Cara kerja</a><a href="#fitur">Fitur</a><a href="#harga">Harga</a></nav>
          <div className="row"><Link href="/login" className="btn btn-ghost btn-sm">Masuk</Link><Link href="/register" className="btn btn-primary btn-sm">Daftar gratis</Link></div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div>
            <h1>Jualan online cukup dari satu tautan.</h1>
            <p className="lead">Buat toko digital sendiri, jual e-book, template, kelas, dan jasa. Pembeli bayar, produk terkirim otomatis.</p>
            <div className="row wrap">
              <Link href="/register" className="btn btn-primary">Buat toko gratis</Link>
              <a href="#cara" className="btn btn-ghost">Lihat cara kerja</a>
            </div>
          </div>
          <div className="phone" aria-hidden="true">
            <div className="av">R</div>
            <div className="nm">Rara Kreatif</div>
            <div className="bio">Template dan panduan untuk kreator pemula</div>
            <span className="lnk">Grup belajar gratis</span>
            <div className="prd"><div className="th" /><div><b>Template Konten IG</b>30 hari siap edit</div><span className="pr">Rp49.000</span></div>
            <div className="prd"><div className="th" /><div><b>E-book Jualan Online</b>Panduan dari nol</div><span className="pr">Rp79.000</span></div>
            <div className="prd"><div className="th" /><div><b>Kelas Foto Produk</b>6 video pendek</div><span className="pr">Rp149.000</span></div>
            <div className="toast">Pesanan baru <span>Rp79.000</span></div>
          </div>
        </div>
      </section>

      <section className="block" id="cara">
        <div className="container">
          <h2>Dari daftar sampai pesanan pertama</h2>
          <p className="muted">Tidak perlu membangun website dari awal.</p>
          <div className="steps">
            {STEPS.map(([t, d], i) => <div className="step" key={t}><div className="n">{i + 1}</div><h3>{t}</h3><p className="muted">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="block" id="fitur" style={{ background: "var(--mist)" }}>
        <div className="container">
          <h2>Semua yang dibutuhkan penjual</h2>
          <div className="featlist">
            {FEATS.map(([t, d]) => <div className="feat" key={t}><h3>{t}</h3><p className="muted">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="block" id="harga">
        <div className="container">
          <h2>Mulai gratis, upgrade saat butuh</h2>
          <p className="muted">Biaya hanya dikenakan saat kamu menarik saldo.</p>
          <div className="plans">
            <div className="plan"><b>Free</b><div className="big">5%</div><p className="muted">biaya per penarikan</p><ul><li>Toko dan produk digital</li><li>Statistik dasar</li><li>Penarikan saldo</li></ul></div>
            <div className="plan pro"><b>Pro</b><div className="big">2%</div><p style={{ opacity: .8 }}>biaya per penarikan</p><ul><li>Semua fitur Free</li><li>Biaya penarikan lebih rendah</li><li>Lencana Pro di toko</li></ul></div>
          </div>
          <FeeCalc />
        </div>
      </section>

      <footer className="site"><div className="container row between wrap"><Logo height={28} /><span>© {new Date().getFullYear()} LOKA. Platform toko digital untuk kreator.</span></div></footer>
    </>
  );
}
