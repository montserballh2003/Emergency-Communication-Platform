import * as z from "zod";

export const messageChat = z.object({
    message: z.string().min(1, "يرجى إدخال رسالة"),
});

export type MessageChatType = z.infer<typeof messageChat>;
