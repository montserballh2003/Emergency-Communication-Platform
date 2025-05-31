import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email({
        message: "البريد الإلكتروني غير صالح",
    }),
    password: z.string().min(1, {
        message: "كلمة المرور مطلوبة",
    }),
});

export const signUpSchema = z
    .object({
        first_name: z.string().min(2, {
            message: "الاسم الأول يجب أن يكون على الأقل حرفين",
        }),
        last_name: z.string().min(2, {
            message: "اسم العائلة يجب أن يكون على الأقل حرفين",
        }),
        email: z.string().email({
            message: "البريد الإلكتروني غير صالح",
        }),
        password: z.string().min(8, {
            message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف",
        }),
        password2: z.string(),
    })
    .refine((data) => data.password === data.password2, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    });

export const forgetPasswordSchema = z.object({
    email: z
        .string()
        .email({
            message: "البريد الإلكتروني غير صالح",
        })
        .optional()
        .or(z.literal("")),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, {
            message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف",
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
