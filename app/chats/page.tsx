import Link from "next/link";
import { getChats } from '@/lib/store';

export default function ChatListPage() {
    const chats = getChats();
    console.log('chats: ', );

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Chats</h2>
            <div className="flex flex-col gap-2">
                {chats.map(chat => {
                    const last = chat.messages[chat.messages.length - 1];
                    return (
                        <Link key={chat.id} href={`/chats/${chat.id}`} className="border p-3 rounded shadow">
                            <div className="font-semibold">{chat.name}</div>
                            <div className="text-sm text-gray-600">{last?.text || "(media)"}</div>
                            <div className="text-xs text-gray-400">{last?.timestamp?.toLocaleString()}</div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
