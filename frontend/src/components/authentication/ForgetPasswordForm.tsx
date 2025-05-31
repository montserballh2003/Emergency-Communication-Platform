"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgetPasswordSchemaType, forgetPasswordSchema } from "@/schemas/auth";
import { Input, Button, cn } from "@nextui-org/react";
import { fetcher } from "@/lib/utils";
import { toast } from "sonner";

type Props = Record<string, never>;

export default function ForgetPasswordForm({}: Props) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgetPasswordSchemaType>({
        resolver: zodResolver(forgetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: ForgetPasswordSchemaType) {
        const res = await fetcher(
            "/users/request-reset-password/?redirect_url=http://localhost:3000/auth/reset-password",
            values,
            "POST"
        );

        if (res.status === 201) {
            toast.success("تم إرسال رمز التحقق بنجاح");
        } else {
            toast.error("فشل في إرسال رمز التحقق, يرجى مراجعة الحساب المستخدم");
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        type="email"
                        label="البريد الإلكتروني"
                        variant="bordered"
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                    />
                )}
            />
            <Button
                type="submit"
                color="primary"
                className={cn("w-full", isSubmitting ? "opacity-50" : "")}
                disabled={isSubmitting}
            >
                إرسال رمز التحقق
            </Button>
        </form>
    );
}
