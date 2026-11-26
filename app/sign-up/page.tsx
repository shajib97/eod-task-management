import Link from "next/link";
import EblLogo from "../../components/EblLogo";
import SignupForm from "./SignupForm";

export default function SignUpPage() {
    return (
        <main className="grid min-h-screen place-items-center bg-[#ffcf00] bg-[radial-gradient(circle,rgba(255,255,255,0.35)_2px,transparent_2px)] bg-size-[20px_20px] px-4 py-10 text-slate-900">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
                <div className="flex justify-center">
                    <EblLogo />
                </div>

                <h1 className="mt-6 text-center text-2xl font-bold">
                    Create your account
                </h1>

                <p className="mt-2 text-center text-sm text-slate-600">
                    Use the work email approved by your EOD administrator.
                </p>

                <SignupForm />

                <Link
                    href="/sign-in"
                    className="mt-5 block text-center text-sm text-blue-700 hover:underline"
                >
                    Back to sign in
                </Link>
            </section>
        </main>
    );
}