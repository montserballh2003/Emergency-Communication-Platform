import { fetcher } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
    children: React.ReactNode;
};

export default async function AuthLayout({ children }: Props) {
    const cookiesStore = await cookies();
    const access = cookiesStore.get("access")?.value ?? "";

    const res = await fetcher(
        "/auth/jwt/verify/",
        {
            token: access,
        },
        "POST"
    );
    if (res.status === 200) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="relative flex-1 flex items-center justify-center p-6 bg-white">
                <Button
                    as={Link}
                    href="/"
                    className="absolute top-6 right-6 bg-none"
                    variant="bordered"
                >
                    رجوع
                </Button>
                {children}
            </div>

            {/* Background Image Section */}
            <div className="relative lg:flex-1">
                <Image
                    src="/emergency.jpg"
                    alt="Firefighter background"
                    fill={true}
                    className="object-cover"
                />
            </div>
        </div>
    );
}
