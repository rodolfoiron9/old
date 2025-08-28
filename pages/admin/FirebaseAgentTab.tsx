import React, { useState, useRef, useEffect } from 'react';
import { getFirebaseAgentResponse } from '../../lib/gemini';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const FirebaseAgentTab: React.FC = () => {
    const [history, setHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const handleSendPrompt = async () => {
        if (!prompt || isLoading) return;

        const userMessage = { role: 'user', text: prompt };
        setHistory(prev => [...prev, { role: 'user', parts: [{ text: prompt }] }]);
        setPrompt('');
        setIsLoading(true);
        setError('');

        try {
            const geminiHistory = history.map(h => ({ role: h.role, parts: h.parts }));
            const responseText = await getFirebaseAgentResponse(prompt, geminiHistory);
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // This is a simple markdown parser to format code blocks
    const formatResponse = (text: string) => {
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Text before the code block
            if (match.index > lastIndex) {
                parts.push(<p key={lastIndex}>{text.substring(lastIndex, match.index)}</p>);
            }
            // The code block
            const language = match[1];
            const code = match[2];
            parts.push(
                <pre key={match.index} className="bg-slate-900/80 p-4 rounded-md overflow-x-auto my-4">
                    <code className={`language-${language}`}>{code}</code>
                </pre>
            );
            lastIndex = match.index + match[0].length;
        }

        // Text after the last code block
        if (lastIndex < text.length) {
            parts.push(<p key={lastIndex}>{text.substring(lastIndex)}</p>);
        }

        return parts;
    };


    return (
        <div className="flex flex-col h-[70vh] bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-2xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-blue/80' : 'bg-slate-800'}`}>
                            {formatResponse(msg.parts[0].text)}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-lg bg-slate-800">
                           <div className="flex items-center gap-2 text-slate-400">
                               <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                               <span>Agent is thinking...</span>
                           </div>
                        </div>
                    </div>
                )}
                {error && <p className="text-brand-red">Error: {error}</p>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                        placeholder="e.g., How do I set up Firestore rules for the blog?"
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-brand-purple"
                    />
                    <button onClick={handleSendPrompt} disabled={isLoading || !prompt} className="px-6 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple disabled:opacity-50">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirebaseAgentTab;