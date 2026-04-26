import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { Contract } from '../../types';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface AIChatProps {
  contract: Contract;
}

const QUICK_QUESTIONS = [
  'Wanneer moet ik opzeggen?',
  'Zijn er valkuilen?',
  'Wat zijn mijn rechten?',
  'Kosten bij vroegtijdig opzeggen?',
];

export function AIChat({ contract }: AIChatProps) {
  const [msgs, setMsgs] = useState<Message[]>([{
    role: 'ai',
    text: `Ik heb "${contract.name}" geanalyseerd. Stel gerust vragen over de voorwaarden, kosten of opzegtermijnen.`,
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMsgs(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const ctx = `Contract: ${contract.name} bij ${contract.provider}. ` +
        (contract.notes ? `Notities: ${contract.notes}. ` : '') +
        `Maandlast: €${contract.monthlyAmount}. ` +
        (contract.endDate ? `Einddatum: ${contract.endDate}. ` : 'Doorlopend. ') +
        `Opzegtermijn: ${contract.noticePeriodDays} dagen.`;

      // @ts-ignore — window.claude is injected by the Claude Code runtime
      const res = await window.claude?.complete({
        messages: [{
          role: 'user',
          content: `Je bent een contractbeheer-assistent. Beantwoord in het Nederlands, bondig en duidelijk.\n\nContext: ${ctx}\n\nVraag: ${text}`,
        }],
      });
      setMsgs(m => [...m, { role: 'ai', text: res ?? 'Kon geen antwoord genereren. Probeer opnieuw.' }]);
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Er is een fout opgetreden. Probeer het later opnieuw.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick questions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-mid hover:border-violet/50 hover:text-violet hover:bg-violet-light transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-pactly-gradient flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'ai'
                  ? 'bg-gray-50 text-dark rounded-bl-sm'
                  : 'bg-pactly-gradient text-white rounded-br-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-pactly-gradient flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1 items-center">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-mid animate-pulse" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <textarea
          rows={2}
          className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-colors"
          placeholder="Stel een vraag over dit contract..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }}}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-10 h-10 self-end rounded-xl bg-pactly-gradient text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
