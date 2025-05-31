"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signUpSchema, SignUpFormValues } from "@/schemas/auth";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { cn, fetcher } from "@/lib/utils";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
    const [, setCookie] = useCookies();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            password2: "",
        },
    });

    async function onSubmit(values: SignUpFormValues) {
        const res = await fetcher("/users/", values, "POST");
        const data = await res.json();
        if (res.status !== 201) {
            setError((Object.values(data)[0] as string[])[0]);
        } else {
            setCookie("access", data.access);
            setCookie("refresh", data.refresh);
            router.push("/");
        }
    }

    return (
        <>
            {error && <p>{error[0].toUpperCase() + error.slice(1)}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="الاسم الاول"
                                variant="bordered"
                                isInvalid={!!errors.first_name}
                                errorMessage={errors.first_name?.message}
                            />
                        )}
                    />
                    <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="اسم العائلة"
                                variant="bordered"
                                isInvalid={!!errors.last_name}
                                errorMessage={errors.last_name?.message}
                            />
                        )}
                    />
                </div>

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="email"
                            label="البريد الالكتروني"
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
                                    onClick={() =>
                                        setShowPassword(!showPassword)
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

                <Controller
                    name="password2"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            label="تأكيد كلمة المرور"
                            variant="bordered"
                            isInvalid={!!errors.password2}
                            errorMessage={errors.password2?.message}
                            endContent={
                                <button
                                    type="button"
                                    className="h-full pl-2"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            }
                        />
                    )}
                />

                <Button
                    type="submit"
                    color="primary"
                    className={cn("w-full", isSubmitting ? "opacity-50" : "")}
                    disabled={isSubmitting}
                >
                    سجل الآن
                </Button>
            </form>
        </>
    );
}
