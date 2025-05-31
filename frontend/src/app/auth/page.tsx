"use client";
import LoginForm from "@/components/authentication/LoginForm";
import SignUpForm from "@/components/authentication/SignUpForm";
import { fetcher } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import { Tab, Tabs } from "@nextui-org/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type Props = Record<string, never>;

export default function AuthPage({}: Props) {
    const router = useRouter();

    const signInGoogle = async () => {
        const res = await fetcher("/auth/google/url/", null, "GET");

        if (res.status === 200) {
            const data = await res.json();
            router.push(data.url);
        } else {
            toast.error("فشل تسجيل الدخول، برجاء اعادة المحاولة");
        }
    };

    return (
        <>
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">مرحباً بعودتك!</h1>
                    <p className="text-gray-500 mt-2">
                        مرحباً بعودتك، من فضلك ادخل بياناتك.
                    </p>
                </div>
                <Tabs
                    aria-label="Auth options"
                    color="primary"
                    variant="underlined"
                    className="w-full"
                >
                    <Tab key="login" title="تسجيل الدخول">
                        <LoginForm />
                    </Tab>
                    <Tab key="signup" title="انشاء حساب ">
                        <SignUpForm />
                    </Tab>
                </Tabs>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">
                            او اتصل باستخدام
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onPress={signInGoogle}
                    className="border-1 w-full border-gray-200"
                >
                    <span className="text-xl font-bold">Google</span>
                    <Image
                        src="/google-icon.png"
                        alt="Google"
                        width={30}
                        height={30}
                    />
                </Button>
            </div>
        </>
    );
}
