"use client";

import { AlertItemDetails } from "@/components/specific/AlertItemDetails/page";
import { Modal, ModalBody, ModalContent, ModalTrigger } from "@/components/ui/animated-modal";

// Test component to verify AlertItemDetails functionality
export function AlertDetailsTest() {
    // Mock emergency ID for testing
    const testEmergencyId = "1";

    return (
        <div className="p-6 space-y-4" dir="rtl">
            <h2 className="text-2xl font-bold">اختبار مكون تفاصيل الطوارئ</h2>
            <p className="text-gray-600">
                هذا المكون لاختبار عرض تفاصيل طلبات الطوارئ المحسنة
            </p>
            
            <Modal>
                <ModalTrigger className="bg-blue-600 text-white hover:opacity-75 transition px-4 py-2 rounded-md">
                    عرض تفاصيل طلب الطوارئ (اختبار)
                </ModalTrigger>
                <ModalBody>
                    <ModalContent>
                        <AlertItemDetails id={testEmergencyId} />
                    </ModalContent>
                </ModalBody>
            </Modal>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">الميزات المحسنة:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                    <li>• عرض نوع الطوارئ مع الأيقونة والألوان المناسبة</li>
                    <li>• معلومات مقدم الطلب والتاريخ</li>
                    <li>• خريطة تفاعلية لموقع الطوارئ</li>
                    <li>• معرض صور محسن مع إمكانية التكبير</li>
                    <li>• تصميم متجاوب يدعم RTL</li>
                    <li>• حالات تحميل محسنة</li>
                    <li>• تحسينات الحجم والتخطيط للمودال</li>
                    <li>• دعم محسن للنصوص العربية الطويلة</li>
                    <li>• تحسين عرض الصور داخل المودال</li>
                    <li>• تحسين التمرير والتنقل</li>
                </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800">إصلاحات المشاكل:</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                    <li>✅ إصلاح مشاكل حجم المودال</li>
                    <li>✅ تحسين عرض الصور والمعرض</li>
                    <li>✅ إصلاح مشاكل التصميم المتجاوب</li>
                    <li>✅ تحسين دعم RTL للنصوص العربية</li>
                    <li>✅ إصلاح مشاكل تجاوز المحتوى</li>
                    <li>✅ تحسين التمرير والتنقل</li>
                    <li>✅ تحسين موضع زر الإغلاق</li>
                    <li>✅ تحسين أداء المودال على الأجهزة المختلفة</li>
                </ul>
            </div>
        </div>
    );
}
