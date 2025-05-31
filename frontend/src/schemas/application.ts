import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

export const emergencyApplicationSchema = z.object({
    location: z.string({
        required_error: "يرجى تحديد موقعك",
    }),
    emergency_type: z.enum(["O", "M", "D"], {
        message: "يرجى تحديد نوع المساعدة الصحيح",
    }),
    images: z
        .array(z.instanceof(File))
        .optional()
        .refine((files) => {
            if (!files) return true;
            return files.every(
                (file) =>
                    file.size <= MAX_FILE_SIZE &&
                    ACCEPTED_IMAGE_TYPES.includes(file.type)
            );
        }, "يجب أن يكون حجم كل صورة أقل من 5 ميجابايت")
        .refine((files) => {
            if (!files) return false;
            return files.length <= 5 && files.length > 0;
        }, "يجب أن تحتوي الصور على صورة واحدة على الأقل ولا تزيد عن 5 صور"),
    description: z.string().min(10, "يجب أن يحتوي الوصف على 10 أحرف على الأقل"),
});

export type EmergencyApplicationSchemaType = z.infer<
    typeof emergencyApplicationSchema
>;
