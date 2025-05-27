// lib/parser.ts

const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4})(,|\s)(\s?\d{1,2}:\d{2}(?:\s?[APMapm]{2})?)\s-\s(.*?):\s([\s\S]*)$/;

export function parseWhatsAppChat(chatText: string) {
    const lines = chatText.split(/\r?\n/);
    const messages: any[] = [];

    let currentMessage = null;

    for (let line of lines) {
        const match = line.match(messageRegex);

        if (match) {
            if (currentMessage) messages.push(currentMessage);

            const [_, date, , time, sender, text] = match;

            const timestamp = new Date(`${date} ${time}`);
            const mediaMatch = text.match(/(IMG-|VID-|PTT-|AUDIO-|DOC-)([\w.-]+)/i);
            const mediaName = mediaMatch ? mediaMatch[0] : null;

            currentMessage = {
                // timestamp: timestamp.toISOString(),
                timestamp,
                sender: sender.trim(),
                text: mediaName ? '' : text.trim(),
                mediaName: mediaName || null,
                mediaType: getMediaType(mediaName),
            };
        } else if (currentMessage) {
            // Multiline continuation
            currentMessage.text += '\n' + line.trim();
        }
    }

    if (currentMessage) messages.push(currentMessage);

    return {
        name: inferChatNameFromMessages(messages),
        messages: messages.slice(475),
    };
}

function getMediaType(fileName: string | null) {
    if (!fileName) return null;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', '3gp', 'mov'].includes(ext)) return 'video';
    if (['opus', 'ogg', 'mp3'].includes(ext)) return 'audio';
    return 'file';
}

function inferChatNameFromMessages(messages: any[]) {
    const names = new Set(messages.map(m => m.sender));
    return names.size === 1 ? [...names][0] : 'Group Chat';
}
