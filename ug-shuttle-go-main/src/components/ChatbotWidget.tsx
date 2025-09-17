import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const SUGGESTED_INTENTS = [
  'Next shuttle from Main Gate',
  'Current status of Shuttle A1',
  'Show UG campus routes',
  'How to book a seat',
  'Enable notifications',
];

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);

    // Simple rule-based responses for now
    const response = getResponse(text.trim());
    const botMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response };
    setTimeout(() => setMessages((prev) => [...prev, botMsg]), 300);
  };

  const getResponse = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('main gate')) return 'Next shuttle at Main Gate arrives in 5–7 minutes.';
    if (lower.includes('status of shuttle')) return 'Shuttle A1 is active on Route 2 near Balme Library.';
    if (lower.includes('routes')) return 'Active routes: Central Loop, Pentagon–Night Market, Great Hall–Commonwealth.';
    if (lower.includes('book')) return 'Go to Book Ride, select route and time, then confirm to get a QR code.';
    if (lower.includes('notification')) return 'Open Settings → Notifications to customize alerts for arrivals and delays.';
    return 'I can help with shuttle status, ETAs, routes, booking, and notifications.';
  };

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button className="rounded-full shadow-strong" size="icon" onClick={() => setOpen(true)}>
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-strong">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Shuttle Assistant</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_INTENTS.map((s) => (
                <Button key={s} variant="secondary" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div ref={listRef} className="h-60 overflow-y-auto rounded-md border border-border p-2 bg-card/60 backdrop-blur-sm">
            {messages.map((m) => (
              <div key={m.id} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {m.content}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">Ask about arrivals, routes, or bookings.</div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { send(input); setInput(''); } }} />
            <Button onClick={() => { send(input); setInput(''); }} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotWidget;


