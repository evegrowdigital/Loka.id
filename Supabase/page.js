"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { sb, configured } from "@/lib/db";

const pesan = (m) => /invalid login/i.test(m) ? "Email atau kata sandi salah." : /not confirmed/i.test(m) ? "Email belum dikonfirmasi. Cek kotak masuk emailmu." : m;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!configured()) return setErr("Supabase belum disambungkan. Lihat README.");
    setBusy(true);
    const c = sb();
    const { data, error } = await c.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) { setBusy(false); return setErr(pesan(error.message)); }
    const { data: prof } = await c.from("profiles").select("role, suspended").eq("id", data.user.id).single();
    if (prof?.suspended) { await c.auth.signOut(); setBusy(false); return setErr("Akun ini sedang dinonaktifkan. Hubungi admin LOKA."); }
    router.push(prof?.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="authwrap">
      <div className="authbox">
        <Logo />
        <h1>Masuk ke LOKA</h1>
        <p className="muted" style={{ marginBottom: 18 }}>Kelola toko, produk, dan penghasilanmu.</p>
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="field"><label htmlFor="pw">Kata sandi</label><input id="pw" className="input" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></div>
          {err && <div className="err" style={{ marginTop: 14 }} role="alert">{err}</div>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={busy}>{busy ? "Memproses…" : "Masuk"}</button>
        </form>
        <p className="small muted" style={{ marginTop: 16 }}>Belum punya akun? <Link href="/register" style={{ color: "var(--blue-d)", fontWeight: 700 }}>Daftar gratis</Link></p>
      </div>
    </div>
  );
}
