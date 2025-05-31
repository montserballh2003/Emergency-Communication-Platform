"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Loader2 } from "lucide-react"; // Removed ChevronLeft, ChevronRight
import { Card, CardBody, CardHeader, Link } from "@nextui-org/react"; // Removed Input
import { Button } from "@nextui-org/button";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
// import { UserContext } from "../../layout"; // Removed: 'UserContext' is defined but never used.
import { useCookies } from "react-cookie";

interface Room {
    id: number;
    room: string;
}

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Room[];
}

export default function AdminChatsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [cookies] = useCookies();

    // Wrapped fetchRooms in useCallback to make it a stable dependency for useEffect
    const fetchRooms = useCallback(async (url: string) => {
        setLoading(true);

        const response = await fetcher(url, null, "GET", cookies["access"]);

        if (response.status === 200) {
            const data: PaginatedResponse = await response.json();

            console.log(data);
            setRooms(data.results);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error("فشل تحميل الغرف، برجاء اعادة المحاولة");
        }
    }, [cookies]); // Removed toast.error, setLoading, and setRooms

    useEffect(() => {
        fetchRooms("/chats/");
    }, [fetchRooms]); // Added fetchRooms to the dependency array

    return (
        <div className="container mx-auto py-10">
            <Card className="border-none shadow-md">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg font-bold text-3xl">
                    رسائل العملاء
                </CardHeader>
                <CardBody className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-gray-50 dark:bg-gray-800 border-b">
                                <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <div className="col-span-2">
                                        الرقم التعريفى
                                    </div>
                                    <div className="col-span-6 text-center mr-[20rem]">
                                        اسم الغرفة
                                    </div>
                                    <div className="col-span-2 text-left">
                                        الاجراءات
                                    </div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y">
                                {rooms.map((room) => ( // Removed 'index'
                                    <div
                                        key={room.id}
                                        className="grid grid-cols-12 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="col-span-2 font-medium">
                                            {room.id}
                                        </div>
                                        <div className="col-span-8 text-center">
                                            الغرفة {room.room}
                                        </div>
                                        <div className="col-span-2">
                                            <Button
                                                href={`/admin/chats/${room.id}?room=${room.room}`}
                                                as={Link}
                                                size="sm"
                                            >
                                                عرض
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
