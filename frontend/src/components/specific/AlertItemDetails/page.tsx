"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip, Skeleton } from "@nextui-org/react";
import { Heart, HandHeart, AlertTriangle, User, MapPin, Clock } from "lucide-react";
import { fetcher, formatDateTime, emergencyTypeConfig, EmergencyType } from "@/lib/utils";
import { EmergencyMap } from "@/components/ui/emergency-map";
import { ImageGallery } from "@/components/ui/image-gallery";


type Props = {
    id: string;
};

type AlertRequest = {
    created_at: string;
    description: string;
    emergency_type: EmergencyType;
    id: number;
    images: { id: number; image: string }[];
    location: string;
    user_first_name: string;
    user_last_name: string;
};

// Icon mapping for emergency types
const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
        case "M":
            return Heart;
        case "O":
            return HandHeart;
        case "D":
            return AlertTriangle;
        default:
            return AlertTriangle;
    }
};

export function AlertItemDetails({ id }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AlertRequest | null>(null);
    console.log(data);

    useEffect(() => {
        fetcher(`/emergency/${id}/`, null, "GET")
            .then((res) => res.json())
            .then((data) => {
                setData(data as AlertRequest);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return (
            <div className="w-full space-y-6" dir="rtl">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-5/6 rounded-lg" />
                    <Skeleton className="h-4 w-4/6 rounded-lg" />
                </div>
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full text-center" dir="rtl">
                <div className="py-12">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        حدث خطأ أثناء تحميل البيانات
                    </h3>
                    <p className="text-gray-600">
                        برجاء اعادة المحاولة لاحقا أو تحديث الصفحة
                    </p>
                </div>
            </div>
        );
    }

    const emergencyConfig = emergencyTypeConfig[data.emergency_type];
    const EmergencyIcon = getEmergencyIcon(data.emergency_type);

    return (
        <div className="w-full space-y-3 sm:space-y-4 md:space-y-6" dir="rtl">
            {/* Emergency Type Header */}
            <Card className={`${emergencyConfig.bgColor} ${emergencyConfig.borderColor} border-2 shadow-sm`}>
                <CardBody className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-full ${emergencyConfig.bgColor} ${emergencyConfig.borderColor} border flex-shrink-0`}>
                            <EmergencyIcon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${emergencyConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 break-words leading-tight">
                                طلب مساعدة - {emergencyConfig.label}
                            </h1>
                            <Chip
                                variant="flat"
                                size="sm"
                                className={`${emergencyConfig.bgColor} ${emergencyConfig.color} font-semibold text-xs sm:text-sm`}
                            >
                                {emergencyConfig.label}
                            </Chip>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Requester and Timestamp Information */}
            <Card className="shadow-sm">
                <CardBody className="p-3 sm:p-4 md:p-6">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 mb-1">مقدم الطلب</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                    {data.user_first_name} {data.user_last_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 mb-1">تاريخ الطلب</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                    {formatDateTime(data.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Location Information */}
            <Card className="shadow-sm">
                <CardBody className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">الموقع</h2>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <p className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 break-words leading-relaxed">{data.location}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">فلسطين</p>
                        </div>

                        {/* Interactive Map */}
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                            <EmergencyMap location={data.location} className="h-40 sm:h-48 md:h-56 lg:h-64" />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Emergency Description */}
            <Card className="shadow-sm">
                <CardBody className="p-3 sm:p-4 md:p-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">وصف الحالة</h2>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                            {data.description}
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Image Gallery */}
            <Card className="shadow-sm">
                <CardBody className="p-3 sm:p-4 md:p-6">
                    <ImageGallery images={data.images} />
                </CardBody>
            </Card>
        </div>
    );
}
