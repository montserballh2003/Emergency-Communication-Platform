"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { MapPin } from "lucide-react";
import { Button, Link, Select, SelectItem, Textarea } from "@nextui-org/react";
import {
    EmergencyApplicationSchemaType,
    emergencyApplicationSchema,
} from "@/schemas/application";
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload";
import { LocationSelector } from "@/components/ui/location-selector";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Params = {
    token: string;
};

// Removed locations array as it's now handled in LocationSelector component

const assistanceTypes = [
    { value: "M", text: "طبية" },
    { value: "O", text: "إغاثة" },
    { value: "D", text: "خطر" },
];

export function EmergencyForm({ token }: Params) {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<EmergencyApplicationSchemaType>({
        resolver: zodResolver(emergencyApplicationSchema),
        defaultValues: {
            location: "",
            description: "",
            images: [],
        },
    });

    async function onSubmit(data: EmergencyApplicationSchemaType) {
        try {
            console.log("Form submission data:", data);
            console.log("Images count:", data.images?.length || 0);
            console.log("Location:", data.location);

            const formData = new FormData();

            // Append images if they exist
            if (data.images && data.images.length > 0) {
                data.images.forEach((file: File, index) => {
                    console.log(`Appending image ${index + 1}:`, file.name, file.size);
                    formData.append(`images`, file);
                });
            }

            formData.append("location", data.location);
            formData.append("emergency_type", data.emergency_type);
            formData.append("description", data.description);

            // Log FormData contents
            console.log("FormData contents:");
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/emergency/create/`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 201) {
                toast.success("تم إرسال الطلب بنجاح");
                router.refresh();
                router.push("/");
            } else {
                const errorData = await res.json();
                console.error("Server error:", errorData);
                toast.error("حدث خطأ أثناء إرسال الطلب, برجاء اعادة المحاولة");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("حدث خطأ أثناء إرسال الطلب, برجاء اعادة المحاولة");
        }
    }

    // Image handling is now managed by the EnhancedFileUpload component

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                                    أرسل إشعار للطوارئ
                                </h1>
                                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                    املأ النموذج أدناه لإرسال طلب المساعدة
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-6 lg:p-8">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                {/* Enhanced Location Selection with Geolocation */}
                <div className="space-y-2">
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <LocationSelector
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.location?.message}
                                isInvalid={!!errors.location}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        نوع المساعدة (إجباري) *
                    </label>
                    <Controller
                        name="emergency_type"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="من فضلك اختر نوع المساعدة"
                                {...field}
                                errorMessage={errors.emergency_type?.message}
                                isInvalid={!!errors.emergency_type}
                            >
                                {assistanceTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.text}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}
                    />
                </div>

                {/* Enhanced File Upload with Camera */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        ارفق صور للحالة (إجباري) *
                    </label>

                    <Controller
                        name="images"
                        control={control}
                        render={({ field }) => (
                            <EnhancedFileUpload
                                onChange={field.onChange}
                                isMultiple={true}
                                maxFiles={5}
                                value={field.value || []}
                            />
                        )}
                    />

                    {errors.images && (
                        <p className="text-xs text-danger">
                            {errors.images.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        وصف الحالة (إجباري) *
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                placeholder="من فضلك اكتب وصف الحالة بالتفصيل..."
                                minRows={8}
                                maxRows={20}
                                {...field}
                                errorMessage={errors.description?.message}
                                isInvalid={!!errors.description}
                                className="break-words-safe"
                            />
                        )}
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                    <Button
                        as={Link}
                        href="/"
                        type="button"
                        variant="bordered"
                        color="default"
                        className="w-full sm:w-auto order-2 sm:order-1"
                        size="lg"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        className="w-full sm:w-auto order-1 sm:order-2"
                        size="lg"
                    >
                        أرسل الطلب
                    </Button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}
