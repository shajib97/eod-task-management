import EblLogo from "../components/EblLogo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#ffcf00] px-6 py-16 text-slate-900">
      <section className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl bg-white px-6 py-12 text-center shadow-xl sm:px-12">
        <EblLogo />

        <h1 className="text-3xl font-bold sm:text-5xl">
          EOD Task Management
        </h1>

        <p className="max-w-md text-lg text-slate-600">
          Track shift duties, hand over unfinished tasks, and review shift reports.
        </p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-[#ffcf00] px-6 py-3 font-semibold hover:bg-yellow-400"
        >
          Sign in
        </Link>
      </section>
    </main>
  );
}