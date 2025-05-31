"use client";

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';

import Footer from "@/components/global/Footer";
import Header from "@/components/global/Header";
import Chat from "@/components/specific/Chat";
import { fetcher } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import React, { createContext, useEffect, useState, Suspense } from "react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

type Props = { children: React.ReactNode };

export type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
};

export type UserContextType = {
    isValid: boolean;
    isLoading: boolean;
    user: User | null;
};

export const UserContext = createContext<UserContextType | null>(null);

function HomeLayoutContent({ children }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [cookies] = useCookies();
    const params = useSearchParams();
    const error = params?.get("error");

    useEffect(() => {
        if (error === "not-logged-in") {
            toast.error("يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة");
        }
    }, [error]);

    useEffect(() => {
        fetcher(
            "/auth/jwt/verify/",
            {
                token: cookies["access"],
            },
            "POST"
        )
            .then((res) => {
                if (res.status === 200) {
                    setIsValid(true);
                    fetcher("/users/me/", null, "GET", cookies["access"])
                        .then((res) => {
                            return res.json();
                        })
                        .then((data) => {
                            setUser(data);
                            setIsLoading(false);
                        });
                } else {
                    setIsValid(false);
                    setIsLoading(false);
                }
            })
            .then(() => {});
    }, [cookies]);

    return (
        <UserContext.Provider value={{ isValid, isLoading, user }}>
            <div className="flex flex-col min-h-screen relative">
                <Header />
                <main className="flex-1 ">{children}</main>
                <Footer />
                {user && !user?.is_admin && <Chat />}
            </div>
        </UserContext.Provider>
    );
}

export default function HomeLayout({ children }: Props) {
    return (
        <Suspense fallback={
            <div className="flex flex-col min-h-screen relative">
                <div className="flex-1 flex items-center justify-center">
                    <p className="font-bold text-2xl">جارى التحميل...</p>
                </div>
            </div>
        }>
            <HomeLayoutContent>{children}</HomeLayoutContent>
        </Suspense>
    );
}
