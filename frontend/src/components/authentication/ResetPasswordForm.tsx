"use client";
import { fetcher } from "@/lib/utils";
import { ResetPasswordSchemaType, resetPasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
    code: string;
    email: string;
};

export default function ResetPasswordForm({ code, email }: Props) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: ResetPasswordSchemaType) {
        const res = await fetcher(
            "/users/confirm-reset-password/",
            {
                new_password: values.password,
                email,
                code,
            },
            "POST"
        );

        if (res.status === 201) {
            toast.success("تم تغيير كلمة المرور بنجاح");
            router.push("/auth");
        } else {
            const res = await fetcher(
                "/users/request-reset-password/?redirect_url=http://localhost:3000/auth/reset-password/",
                {
                    email,
                },
                "POST"
            );
            if (res.status === 201) {
                toast.error(
                    "فشل في تغيير كلمة المرور, يرجى مراجعة الحساب المستخدم, تم ارسال ايميل اخر"
                );
            } else {
                toast.error("فشل في تغيير كلمة المرور, يرجى المحاولة لاحقا");
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        label="كلمة المرور"
                        variant="bordered"
                        isInvalid={!!errors.password}
                        errorMessage={errors.password?.message}
                        endContent={
                            <button
                                type="button"
                                className="h-full pl-2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        }
                    />
                )}
            />

            <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        label="تأكيد كلمة المرور"
                        variant="bordered"
                        isInvalid={!!errors.confirmPassword}
                        errorMessage={errors.confirmPassword?.message}
                        endContent={
                            <button
                                type="button"
                                className="h-full pl-2"
                                onClick={() =>
                                    setShowConfirmPassword(!showPassword)
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        }
                    />
                )}
            />

            <Button type="submit" color="primary" className="w-full">
                تغير كلمة المرور
            </Button>
        </form>
    );
}
