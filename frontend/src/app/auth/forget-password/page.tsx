import ForgetPasswordForm from "@/components/authentication/ForgetPasswordForm";
import React from "react";

type Props = Record<string, never>;

export default function ForgetPasswordPage({}: Props) {
    return (
        <>
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">هل نسيت كلمة السر</h1>
                    <p className="text-gray-500 mt-2">
                        لا داعي للقلق، أدخل رقم هاتفك المحمول أدناه، وسنرسل لك
                        رمز التحقق المكون من 6 أرقام لإعادة كلمة المرور الخاصة
                        بك.
                    </p>
                </div>

                <ForgetPasswordForm />
            </div>
        </>
    );
}
