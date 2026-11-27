import { Suspense } from "react";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import { hasWorkspaceSession } from "../lib/backend";

async function SignInEntry() {
    if (await hasWorkspaceSession()) redirect("/dashboard");
    return <SignInForm />;
}

export default function Home() {
    return (
        <Suspense fallback={<SignInForm />}>
            <SignInEntry />
        </Suspense>
    );
}
