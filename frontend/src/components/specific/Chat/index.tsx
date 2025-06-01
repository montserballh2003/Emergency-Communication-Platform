"use client";

import { UserContext, UserContextType } from "@/app/(home)/layout";
import { cn, fetcher, formatTime, getWebSocketURL } from "@/lib/utils"; // Added getWebSocketURL
import { MessageChatType, messageChat } from "@/schemas/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { MessageCircleMore, Minimize2Icon, Send } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Controller, useForm } from "react-hook-form";

type ChatMessage = {
    id: number;
    body: string;
    sender: number;
    chat_room: string;
    created_at: string;
};

function Chat() {
    const [cookies] = useCookies(["access", "user_id"]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const access = cookies["access"];
    const { user } = useContext(UserContext) as UserContextType;
    const currentUserId = user?.id || 1;

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
        if (access) {
            // Use getWebSocketURL to construct the WebSocket URL
            const wsURL = `${getWebSocketURL("/ws/chat/")}?token=${access}`;
            const ws = new WebSocket(wsURL);

            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                setMessages((prev) => [
                    {
                        id: Math.random(),
                        sender: data.user,
                        body: data.message,
                        chat_room: "",
                        created_at: new Date().toISOString(),
                    } as unknown as ChatMessage,
                    ...prev,
                ]);
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
            };

            // Fetch old messages
            fetcher("/chats/messages/", null, "GET", access)
                .then((res) => res.json())
                .then((data) => {
                    setMessages(data["results"]);
                    scrollToBottom();
                });

            return () => {
                ws.close();
            };
        }
    }, [access]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const onSubmit = (data: MessageChatType) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: data.message }));
            reset();
        }
    };

    return open ? (
        <div className="h-[500px] w-[400px] bg-slate-200 fixed bottom-0 right-0 rounded-xl overflow-clip flex flex-col z-50 shadow-lg">
            <header className="flex justify-between items-center bg-blue-600 text-white py-3 px-2">
                <h2 className="font-semibold text-lg">خدمة العملاء</h2>
                <Button
                    className="bg-black/75 p-1 rounded-full min-w-8"
                    onPress={() => setOpen(false)}
                >
                    <Minimize2Icon className="text-white size-4" />
                </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-2 py-3">
                {messages.length === 0 ? (
                    <div className="grid place-content-center h-full">
                        <p>لا يوجد لديك رسائل</p>
                    </div>
                ) : (
                    <div className="flex flex-col-reverse gap-2">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex flex-col mb-1",
                                    msg.sender === currentUserId
                                        ? "items-end"
                                        : "items-start"
                                )}
                            >
                                <p
                                    className={cn(
                                        "max-w-[250px] px-4 py-2 rounded-xl text-white text-sm",
                                        msg.sender === currentUserId
                                            ? "bg-red-500 rounded-tl-none"
                                            : "bg-black/25 rounded-tr-none"
                                    )}
                                >
                                    {msg.body}
                                </p>
                                <span
                                    className={`text-xs mt-1 block text-right text-gray-500`}
                                >
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            <form
                className="flex gap-2 px-2 border-t border-gray-300 pt-3 pb-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="أدخل رسالتك"
                            isInvalid={!!errors.message}
                            errorMessage={errors.message?.message}
                        />
                    )}
                />
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-8 bg-blue-600"
                >
                    <Send className="text-white" />
                </Button>
            </form>
        </div>
    ) : (
        <Button
            onPress={() => setOpen(true)}
            className="fixed bottom-4 right-4 w-16 h-16 px-0 bg-blue-600 text-white rounded-full text-xl font-bold grid place-content-center z-40 shadow-lg"
        >
            <MessageCircleMore className="size-8" />
        </Button>
    );
}

export default dynamic(() => Promise.resolve(Chat), {
    ssr: false,
});
