'use client';
import { getChatById } from '@/lib/store';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function ChatViewerPage({ params }: { params: { chatId: string } }) {
    const chat = getChatById(params.chatId);
    if (!chat) return notFound();

    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chat]);

    let lastDate = '';

    return (
        <div className="p-4 h-screen flex flex-col">
            <h2 className="text-xl font-bold mb-4">{chat.name}</h2>
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3">
                {chat.messages.map((msg, index) => {
                    const date = new Date(msg.timestamp).toLocaleDateString();
                    const showDate = date !== lastDate;
                    lastDate = date;

                    return (
                        <div key={index} className="flex flex-col items-start">
                            {showDate && (
                                <div className="self-center text-xs text-gray-500 py-1">{date}</div>
                            )}
                            <div
                                className={`relative p-2 rounded max-w-[80%] shadow-md ${msg.sender === chat.name ? 'bg-gray-100 self-start' : 'bg-green-100 self-end'}`}
                            >
                                <div className="text-xs text-gray-600 mb-1">{msg.sender}</div>
                                <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                                {msg.mediaName && (
                                    <div className="mt-2">
                                        {msg.mediaType === 'image' ? (
                                            <Image
                                                src={`/media/${msg.mediaName}`}
                                                alt="media"
                                                width={200}
                                                height={200}
                                                className="rounded"
                                            />
                                        ) : (
                                            <a
                                                href={`/media/${msg.mediaName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline text-sm"
                                            >
                                                {msg.mediaName}
                                            </a>
                                        )}
                                    </div>
                                )}
                                <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
