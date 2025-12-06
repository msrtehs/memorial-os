
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Search as SearchIcon, HeartHandshake } from 'lucide-react';
import { ChatMessage } from '../types';
import { BrandLogoIcon } from './Sidebar';

const SYSTEM_INSTRUCTION = `
PERFIL DA IA: "Agente de Acolhimento MemorialOS"
PERSONA: Você é um guia compassivo, calmo e profundamente empático. Você fala como um conselheiro de luto experiente e um concierge atencioso.

MISSÃO:
1. Acolher famílias em momento de dor com dignidade.
2. Ajudar a localizar entes queridos (simule a busca).
3. Explicar serviços (flores, homenagens) sem parecer vendedor, mas sim facilitador de memórias.
4. Fornecer informações práticas (horários, localização) com clareza.

REGRAS DE COMPORTAMENTO:
- Use linguagem suave ("partida", "descanso", "homenagem" em vez de termos frios).
- Se perguntarem sobre preços, seja transparente mas delicado.
- Use emojis moderados (🕊️, 🤍, 🌿) para suavizar a comunicação.
- NUNCA invente dados de falecidos. Se não souber, diga que vai chamar um humano.

FERRAMENTAS:
- Use Google Search para buscar obituários se a família pedir ajuda para encontrar um registro externo.
- Use Google Maps para orientar trajetos dentro do cemitério parque.
`;

interface WelcomingAgentProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const WelcomingAgent: React.FC<WelcomingAgentProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Olá. Me chamo Ana, sou o apoio digital do MemorialOS. Sinto muito se você está passando por um momento difícil. Estou aqui para ajudar você a encontrar um ente querido, enviar uma homenagem ou apenas tirar dúvidas. Como posso ser útil?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
        }
      });

      const result = await chat.sendMessage({ message: userMsg.text });
      
      const responseText = result.text;
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: { title: string; uri: string }[] = [];

      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        });
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Compreendo. Estou processando sua solicitação com cuidado.",
        groundingSources: sources
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Peço desculpas, minha conexão está instável no momento. Por favor, poderia tentar novamente em alguns instantes?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button (Secondary trigger) - EXCEPTION: Keeps Hands Icon but Blue Color */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white hover:scale-105 text-blue-600 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all z-50 group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <HeartHandshake className="w-8 h-8 relative z-10 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col border border-white/50 z-50 overflow-hidden font-sans animate-in slide-in-from-bottom-10 fade-in duration-500">
          
          {/* Header - BRANDING: Uses Logo Icon */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-6 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                {/* BRANDING: Logo Icon instead of Hands in the Window Header */}
                <BrandLogoIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight font-serif">Acolhimento</h3>
                <p className="text-xs text-blue-100 opacity-90 font-medium tracking-wide">Sempre aqui por você</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-full transition-colors relative z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative ${
                    msg.role === 'user'
                      // BRANDING: User bubbles are Blue
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-200'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                  
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200/50 text-xs">
                      <p className="font-bold opacity-80 mb-1 flex items-center gap-1">
                        <SearchIcon className="w-3 h-3" /> Fontes verificadas:
                      </p>
                      <ul className="space-y-1">
                        {msg.groundingSources.map((src, idx) => (
                          <li key={idx}>
                            <a 
                              href={src.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-300 hover:text-white hover:underline truncate block transition-colors"
                            >
                              {src.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white text-slate-400 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 flex items-center gap-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur border-t border-slate-100">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva sua mensagem com carinho..."
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-inner group-hover:bg-white"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center hover:scale-110 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
