import React from "react";
import { notFound } from "next/navigation";
import { fetcher } from "@/lib/utils";
import { cookies } from "next/headers";

type Props = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
    console.log("Hitted");
    const cookieStore = await cookies();
    const access = cookieStore.get("access");
    if (!access?.value) return notFound();

    const res = await fetcher("/users/me/", null, "GET", access.value);
    if (res.status !== 200) return notFound();

    const data = await res.json();
    if (!data.is_admin) return notFound();

    return <>{children}</>;
}
