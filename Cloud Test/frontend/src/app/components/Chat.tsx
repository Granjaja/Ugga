"use client"

import { useState } from 'react';
import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';


type Message = {role: "user" | "assistant", text: string}
type Source = {doc_id: string, chunk_index: number, text_preview: string, source_path: string}

export default  function Chat() {
  
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);
    const {data: session} = useSession();


    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;


   
    const send = async () => {
        if (!input.trim() || !session?.access_token) return;
      
        const userMessage: Message = {role: "user", text: input.trim()};
        setMessages([...messages, userMessage]);
        setInput("");
        setLoading(true);
        
        try {
            const resp = await fetch(`${NEXT_PUBLIC_API_URL}/api/query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "Accept": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: input.trim(),
                    top_k: 5,
                }),
            });
            
            
            if (!resp.ok) {
                const error = await resp.text();
                console.error('Query error:', error);
                throw new Error(error);
            }

            const data = await resp.json();

            // Pass current state value as the argument for function passed into setMessages function
            setMessages((m) => [...m, { role: "assistant", text: data.answer }]);

            setSources(data.sources || []);

        } catch {
            setMessages((m) => [...m, { role: "assistant", text: "Error: could not fetch answer." }]);
            } finally {
            setLoading(false);
            }
        };

return(
  <div>
  <h2 className='text-xl font-bold m-4 flex items-center justify-center p-2 rounded-md'>
    What would you like to look up today?
  </h2>
<div className='flex'>

  
  {
    session?.user.role === "admin" && 
    <div className='w-1/5'>
        <Sidebar />
      </div>

  }
  
      
    <div className={session?.user.role === "admin" ? "w-4/5" : "w-full"}>
      
      <div className="border rounded w-auto p-5 min-h-48 max-h-96 overflow-auto m-5 bg-white">
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
    </div>
    </div>
)

}
