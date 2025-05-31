"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { fetcher, formatTime } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Send } from "lucide-react";
import {
    notFound,
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Controller, useForm } from "react-hook-form";
import { MessageChatType, messageChat } from "@/schemas/messages";
import { Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { UserContext } from "@/app/(home)/layout";

type ChatMessage = {
    id: number;
    body: string;
    sender: number;
    chat_room: string;
    created_at: string;
};

export default function AdminChatRoom() {
    const [cookies] = useCookies(["access"]);
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as string;
    const room = searchParams.get("room") as string;

    const bottomRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const access = cookies["access"];
    const context = useContext(UserContext);
    const currentUserId = context?.user?.id;

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MessageChatType>({
        resolver: zodResolver(messageChat),
        defaultValues: {
            message: "",
        },
    });

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (access && room) {
            // Fetch user info for this room
            fetcher(`/chats/${id}/messages`, null, "GET", access)
                .then((res) => res.json())
                .then((data) => {
                    setMessages(data.results);
                })
                .catch((err) => {
                    console.error("Error fetching room info:", err);
                });

            // Connect to WebSocket
            const ws = new WebSocket(
                `ws://localhost:8000/ws/chat/${room}/?token=${access}`
            );

            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                setMessages((prev) => [
                    {
                        id: Math.random(),
                        sender: data.user,
                        body: data.message,
                        chat_room: room,
                        created_at: new Date().toISOString(),
                    } as ChatMessage,
                    ...prev,
                ]);
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                setIsConnected(false);
            };
            
            return () => {
                ws.close();
            };
        }
    }, [access, room, id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!id || !room) return notFound();

    const onSubmit = (data: MessageChatType) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: data.message }));
            reset();
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <Card className="border shadow-md h-[calc(100vh-100px)] flex flex-col">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push("/admin/chats")}
                            className="mr-2"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg">اسم المستخدم</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                    رقم الغرفة: {room}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="flex-1 fle overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="grid place-content-center h-full">
                            <p className="text-gray-500">لا يوجد رسائل بعد</p>
                        </div>
                    ) : (
                        <div className="flex flex-col-reverse gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.sender === currentUserId
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                            msg.sender === currentUserId
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                                        }`}
                                    >
                                        <p className="text-sm">{msg.body}</p>
                                        <span
                                            className={`text-xs mt-1 block text-right ${
                                                msg.sender === currentUserId
                                                    ? "text-blue-100"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </CardBody>

                <div className="p-4 border-t">
                    <form
                        className="flex gap-2"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Controller
                            name="message"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="قم بكتابة رسالتك هنا..."
                                    className="flex-1"
                                    disabled={!isConnected}
                                />
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isConnected}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            ارسال
                        </Button>
                    </form>
                    {errors.message && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.message.message}
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

