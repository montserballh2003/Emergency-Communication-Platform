"use client";

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalTrigger,
} from "@/components/ui/animated-modal";
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { AlertItemDetails } from "../AlertItemDetails/page";

interface AlertRequest {
    id: string;
    user_first_name: string;
    user_last_name: string;
    image: string;
    created_at: string;
    location: string;
}

type Props = {
    data: AlertRequest[];
    heading: string;
};

export function AlertSection({ data, heading }: Props) {
    // Sample data - in a real app, this would come from an API

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Link
                        href="/previous"
                        className="text-blue-500 hover:text-blue-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-bold">{heading}</h2>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex items-center justify-center w-full h-32">
                    <p className="text-gray-500">لا توجد تنبيهات حالياً</p>
                </div>
            ) : (
                <ScrollShadow
                    orientation="horizontal"
                    className="flex gap-4 w-full overflow-x-auto pb-4"
                >
                    {data.map((alert) => (
                        <Card
                            key={alert.id}
                            className="flex-none w-[300px] border border-gray-200"
                        >
                            <CardBody className="gap-4">
                                <div className="flex gap-2">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-sm text-start">
                                            {alert.user_first_name +
                                                " " +
                                                alert.user_last_name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {alert.location}
                                        </p>
                                    </div>
                                    <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                                </div>
                                <div className="flex justify-end gap-2 border-t-1 pt-4">
                                    <Modal key={Math.random()}>
                                        <ModalTrigger className="bg-blue-600 text-sm text-white hover:opacity-75 transition">
                                            عرض التفاصيل
                                        </ModalTrigger>
                                        <ModalBody>
                                            <ModalContent>
                                                <AlertItemDetails id={alert.id} />
                                            </ModalContent>
                                        </ModalBody>
                                    </Modal>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </ScrollShadow>
            )}
        </div>
    );
}
