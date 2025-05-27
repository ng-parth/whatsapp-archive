// import { NextRequest, NextResponse } from 'next/server';
// import AdmZip from 'adm-zip';
// import { mkdir, writeFile } from 'fs/promises';
// import path from 'path';
// import { saveChat } from '@/lib/store';
// import crypto from 'crypto';
// // import { saveParsedChat } from '@/lib/store';
// import fs from 'fs/promises';
//
// function parseLine(line: string) {
//     const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2} (AM|PM)) - (.*?): (.*)$/;
//     const match = line.match(messageRegex);
//     if (!match) return null;
//     const [_, date, time, sender, text] = match;
//     const timestamp = new Date(`${date} ${time}`);
//     const mediaMatch = text.match(/(IMG|VID|PTT|AUDIO|DOC)-\d{8}-WA\d{4}\.[a-z0-9]+/i);
//
//     return {
//         timestamp,
//         sender,
//         text,
//         mediaName: mediaMatch?.[0] || null,
//         mediaType: mediaMatch?.[0]?.startsWith("IMG") ? "image" : mediaMatch?.[0]?.startsWith("VID") ? "video" : null
//     };
// }
//
// export async function POST(req: NextRequest) {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     if (!file || !file.name.endsWith('.zip')) {
//         console.log('❌ Invalid file uploaded');
//         return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
//     }
//     console.log('📦 ZIP file received:', file.name);
//
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const zip = new AdmZip(buffer);
//     const entries = zip.getEntries();
//     const txtEntry = entries.find(e => e.entryName.endsWith(".txt"));
//     if (!txtEntry) return NextResponse.json({ error: "No .txt chat file found in archive" }, { status: 400 });
//
//     let chatTxt = txtEntry.getData().toString("utf-8");
//     const lines = chatTxt.split(/\r?\n/);
//     const parsedMessages = lines.map(parseLine).filter(Boolean);
//
//     const mediaDir = path.join(process.cwd(), "public/media");
//     console.log('📂 Extracting files...');
//
//     await mkdir(mediaDir, { recursive: true });
//     for (const entry of entries) {
//         const entryName = entry.entryName;
//         if (entryName.endsWith('.txt') && !chatTxt) {
//             chatTxt = entry.getData().toString('utf-8');
//             console.log('📝 Chat text extracted:', entryName);
//         } else {
//             const mediaPath = path.join(mediaDir, path.basename(entryName));
//             await fs.writeFile(mediaPath, entry.getData());
//             console.log('📁 Media saved:', mediaPath);
//         }
//     }
//     if (!chatTxt) {
//         console.log('❌ No .txt file found in zip');
//         return NextResponse.json({ error: 'No chat file found' }, { status: 400 });
//     }
//
//     console.log('🧠 Parsing chat...');
//
//     const chatName = txtEntry.entryName.replace("WhatsApp Chat with ", "").replace(".txt", "");
//     const chatId = crypto.createHash('md5').update(chatName).digest('hex');
//     saveChat({ id: chatId, name: chatName, messages: parsedMessages });
//     console.log('📝 Chat saved:', parsedMessages);
//
//     return NextResponse.json({ success: true });
// }


import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { saveChat } from '@/lib/store';
import crypto from 'crypto';
import { parseWhatsAppChat } from '@/lib/parser';

function parseLine(line: string) {
    const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2} (AM|PM)) - (.*?): (.*)$/;
    const match = line.match(messageRegex);
    if (!match) {
        console.log('❌ Invalid line:', line);
        return null
    };
    const [_, date, time, sender, text] = match;
    const timestamp = new Date(`${date} ${time}`);
    const mediaMatch = text.match(/(IMG|VID|PTT|AUDIO|DOC)-\d{8}-WA\d{4}\.[a-z0-9]+/i);

    return {
        timestamp,
        sender,
        text,
        mediaName: mediaMatch?.[0] || null,
        mediaType: mediaMatch?.[0]?.startsWith("IMG") ? "image" : mediaMatch?.[0]?.startsWith("VID") ? "video" : null
    };
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    console.log('📦 ZIP file received:', file.name);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const txtEntry = entries.find(e => e.entryName.endsWith(".txt"));
    if (!txtEntry) return NextResponse.json({ error: "No .txt chat file found in archive" }, { status: 400 });

    const chatTxt = txtEntry.getData().toString("utf-8");
    console.log('📝 Chat text extracted:');
    const parsedMessages = parseWhatsAppChat(chatTxt);
    console.log('📝 Parsed Chat:', JSON.stringify(parsedMessages));

    const mediaDir = path.join(process.cwd(), "public/media");
    await mkdir(mediaDir, { recursive: true });
    for (const entry of entries) {
        if (entry.entryName.endsWith(".txt")) continue;
        const mediaPath = path.join(mediaDir, entry.entryName);
        await writeFile(mediaPath, entry.getData());
        console.log('📁 Media saved:', mediaPath);
    }

    const chatName = txtEntry.entryName.replace("WhatsApp Chat with ", "").replace(".txt", "");
    const chatId = crypto.createHash('md5').update(chatName).digest('hex');
    saveChat({ id: chatId, name: chatName, messages: parsedMessages });

    return NextResponse.json({ success: true });
}
