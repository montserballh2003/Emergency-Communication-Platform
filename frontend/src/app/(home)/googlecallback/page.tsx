"use client";
import React, { useEffect, Suspense } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

type Props = Record<string, never>;

function GoogleCallbackContent() {
    const router = useRouter();
    const [, setCookie] = useCookies();

    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    useEffect(() => {
        if (!code) {
            notFound();
            return;
        }

        fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/`,
            {
                method: "POST",
                body: JSON.stringify({ code }),
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
            }
        )
            .then((res) => {
                if (res.status === 201) {
                    return res.json();
                } else {
                    toast.error("فشل تسجيل الدخول، برجاء اعادة المحاولة");
                    router.push("/auth");
                }
            })
            .then((data) => {
                if (data) {
                    setCookie("access", data.access_token);
                    setCookie("refresh", data.refresh_token);
                    toast.success("تم تسجيل الدخول بنجاح");
                    router.refresh();
                    router.push("/");
                }
            });
    }, [code, router, setCookie]);
    return (
        <div className="grid place-content-center h-full">
            <p className="font-bold text-2xl">جارى تسجيل الدخول...</p>
        </div>
    );
}

export default function GoogleCallbackPage({}: Props) {
    return (
        <Suspense fallback={
            <div className="grid place-content-center h-full">
                <p className="font-bold text-2xl">جارى التحميل...</p>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
