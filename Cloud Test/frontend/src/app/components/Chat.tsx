"use client"

import { useState } from 'react';

type Message = {role: "user" | "assistant", text: string}
type Source = {doc_id: string, chunk_index: number, text_preview: string, source_path: string}

export default function Chat() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState<any[]>([]);

    const send = async () => {
        if (!input.trim()) return;
        
        const userMessage: Message = {role: "user", text: input.trim()};
        setMessages([...messages, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const resp = await fetch("/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({
                    query: input,
                    top_k: 5,
                }),
                });

                const data = await resp.json();

                setMessages((m) => [...m, { role: "assistant", text: data.answer }]);

                setSources(data.sources || []);

            } catch (err) {
                setMessages((m) => [...m, { role: "assistant", text: "Error: could not fetch answer." }]);
                } finally {
                setLoading(false);
                }
            };
return(

    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">Chat with Vibe</h2>
      <h3 className="text-lg font-medium mb-2">Welcome Name</h3>
      <div className="border rounded p-3 h-48 overflow-auto mb-3 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left my-2"}>
            <div className={m.role === "user" ? "inline-block bg-blue-100 p-2 rounded" : "inline-block bg-gray-100 p-2 rounded"}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ask a question..." />
        <button onClick={send} className="bg-blue-600 text-white px-4 rounded" disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {sources.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h4 className="font-semibold">Sources</h4>
          <ul>
            {sources.map((s, i) => (
              <li key={i} className="my-2">
                <div className="text-sm">
                  <strong>{s.doc_id}</strong> (chunk {s.chunk_index}) — <span className="italic">{s.source_path}</span>
                </div>
                <div className="text-xs text-gray-600">{s.text_preview}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
)

}
