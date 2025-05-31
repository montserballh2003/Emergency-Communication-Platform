"use client";
import { Card, CardBody } from "@nextui-org/react";
import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";

type Props = Record<string, never>;

export default function CallUs({}: Props) {
    return (
        <section className="py-12 bg-white" id="call-us">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-8">
                    اتصل بنا
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardBody className="flex flex-col items-center text-center gap-4">
                            <Phone className="w-6 h-6 text-blue-500" />
                            <h3 className="font-bold">الهاتف</h3>
                            <div className="space-y-1 text-sm text-default-500">
                                <p dir="ltr">+970 2384501 / +970 2384501</p>
                                <p dir="ltr">+9702384501 / +970 2384501</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex flex-col items-center text-center gap-4">
                            <Mail className="w-6 h-6 text-blue-500" />
                            <h3 className="font-bold">البريد الكتروني</h3>
                            <div className="space-y-1 text-sm text-default-500">
                                <p>AssistanceFormat.Com.Eg</p>
                                <p>AssistanceFormat.Com.Eg</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex flex-col items-center text-center gap-4">
                            <MapPin className="w-6 h-6 text-blue-500" />
                            <h3 className="font-bold">العنوان الرئيسي</h3>
                            <p className="text-sm text-default-500">
                                القدس - شارع مدينة
                                <br />
                                العربية - فلسطين
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </section>
    );
}
