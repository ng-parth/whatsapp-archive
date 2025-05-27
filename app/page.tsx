'use client';
import { useState } from 'react';

export default function UploadPage() {
    const [loading, setLoading] = useState(false);

    async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        setLoading(false);
        if (res.ok) {
            // alert('Upload Finished.');
            window.location.href = '/chats';
        } else {
            alert('Upload failed.');
        }
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <form onSubmit={handleUpload} className="space-y-4">
                <input type="file" name="file" accept=".zip" required />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {loading ? 'Processing...' : 'Upload'}
                </button>
            </form>
        </div>
    );
}
