import { EmergencyForm } from "@/components/specific/EmergencyForm";
import { cookies } from "next/headers";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function Home() {
    const cookiesStore = await cookies();
    const access = cookiesStore.get("access")?.value ?? "";

    return (
        <main className="min-h-screen bg-gray-50">
            <EmergencyForm token={access} />
        </main>
    );
}
