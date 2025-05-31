"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, LoginFormValues } from "@/schemas/auth";
import { Input, Button, cn } from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { useCookies } from "react-cookie";
import { fetcher } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [, setCookie] = useCookies();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        const res = await fetcher("/auth/jwt/create/", values, "POST");

        if (res.status === 200) {
            const data = await res.json();
            setCookie("access", data.access);
            setCookie("refresh", data.refresh);
            toast.success("تم تسجيل الدخول بنجاح");
            router.push("/");
        } else {
            toast.error("فشل تسجيل الدخول، تأكد من صحة البيانات المدخلة");
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
                        type="tel"
                        label="رقم الهاتف"
                        variant="bordered"
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                    />
                )}
            />

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

            <div className="flex items-center justify-end">
                <Button
                    as={Link}
                    href="/auth/forget-password"
                    variant="light"
                    className="px-0 font-normal"
                >
                    هل نسيت كلمة المرور؟
                </Button>
            </div>

            <Button
                type="submit"
                color="primary"
                className={cn("w-full", isSubmitting ? "opacity-50" : "")}
                disabled={isSubmitting}
            >
                تسجيل الدخول
            </Button>
        </form>
    );
}
