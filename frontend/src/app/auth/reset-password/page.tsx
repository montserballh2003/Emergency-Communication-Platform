import ResetPasswordForm from "@/components/authentication/ResetPasswordForm";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
    searchParams: Promise<{ code?: string; email?: string }>;
};

export default async function ForgetPasswordPage({ searchParams }: Props) {
    const params = await searchParams;
    const code = params.code;
    if (!code) notFound();

    const email = params.email;
    if (!email) notFound();

    return (
        <>
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        تعيين كلمة مرور جديدة
                    </h1>
                    <p className="text-gray-500 mt-2">
                        أدخل كلمة المرور الجديدة أدناه لإكمال عملية إعادة
                        التعيين. تأكد من أنها قوية وآمنة.
                    </p>
                </div>

                <ResetPasswordForm code={code} email={email} />
            </div>
        </>
    );
}
