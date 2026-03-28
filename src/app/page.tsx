'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

type AssistantMode = 'choice' | 'chat' | 'call';

const assistantIntro =
  'Namaste. I can help you explore our IIT-JEE and NEET programs, or arrange a call with our admissions team. Choose how you would like to continue.';

const quickQuestions = [
  'What courses do you offer?',
  'How does admission work?',
  'Tell me about the Pomodoro Method',
  'Which branches are available?',
];

const branchNames = ['Hyderabad', 'Vijayawada', 'Guntur', 'Vizag'];

export default function Home() {
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('choice');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: assistantIntro,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [leadStatus, setLeadStatus] = useState('');
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    city: 'Hyderabad',
    cls: 'Class 11',
    course: 'IIT-JEE',
  });
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, assistantMode, isLoading]);

  const focusChatView = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      if (msgsRef.current) {
        msgsRef.current.scrollTo({
          top: msgsRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 220);
  };

  const appendBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
    focusChatView();
  };

  const chooseChat = () => {
    setAssistantMode('chat');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: 'I want to know more.' },
      {
        role: 'bot',
        text: 'Perfect. Ask me anything about courses, admissions, branches, schedules, or study approach.',
      },
    ]);
    focusChatView();
  };

  const chooseCall = () => {
    setAssistantMode('call');
    setLeadStatus('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: 'I want to request a call.' },
      {
        role: 'bot',
        text: 'Share your details in the callback form and our team will reach out shortly.',
      },
    ]);
    focusChatView();
  };

  const resetToChoice = () => {
    setAssistantMode('choice');
    setInput('');
    setLeadStatus('');
    setMessages([{ role: 'bot', text: assistantIntro }]);
  };

  const submitLead = async () => {
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setLeadStatus('Please enter both name and phone number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(leadForm.phone.trim())) {
      setLeadStatus('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSavingLead(true);
    setLeadStatus('');

    try {
      const payload = {
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        city: leadForm.city,
        class: leadForm.cls,
        course: leadForm.course,
        time: new Date().toLocaleString('en-IN'),
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const details =
          typeof data?.details === 'string' && data.details ? `: ${data.details}` : '';
        setLeadStatus(
          typeof data?.error === 'string'
            ? `${data.error}${details}`
            : `Sheet update failed (${res.status})`
        );
        return;
      }

      setLeadStatus('Request saved successfully. Our team will contact you soon.');
      appendBotMessage(
        `Thanks ${payload.name}. Your callback request has been recorded for ${payload.course} in ${payload.city}.`
      );
      setLeadForm({
        name: '',
        phone: '',
        city: 'Hyderabad',
        cls: 'Class 11',
        course: 'IIT-JEE',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown';
      setLeadStatus(`Error syncing lead: ${message}`);
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleSendMsg = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || isLoading) return;

    if (assistantMode !== 'chat') {
      setAssistantMode('chat');
    }

    setMessages((prev) => [...prev, { role: 'user', text: msgText }]);
    setInput('');
    setIsLoading(true);
    focusChatView();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText }),
      });

      const data = await res.json();

      if (!res.ok) {
        appendBotMessage(
          `Error: ${typeof data.error === 'string' ? data.error : 'Please try again or contact 9555825559.'}`
        );
      } else {
        appendBotMessage(data.reply);
      }
    } catch {
      appendBotMessage('Something went wrong. Please call 9555825559 or message us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#fff1e3_52%,#ffffff_100%)] text-stone-950">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-[rgba(255,248,241,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[460px] items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold tracking-[0.32em] text-white shadow-[0_16px_40px_rgba(24,24,27,0.18)]">
              DB
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-orange-500">
                Dhanik Bharat
              </div>
              <div className="truncate text-base font-semibold text-stone-950">Admissions Assistant</div>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="https://wa.me/919555825559"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-center text-xs font-medium text-stone-700 transition hover:border-orange-400 hover:text-stone-950"
            >
              WhatsApp
            </a>
            <a
              href="tel:9555825559"
              className="rounded-full bg-stone-950 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-orange-500"
            >
              Call
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[460px] flex-col gap-4 px-3 py-4 pb-28">
        <section className="space-y-4">
          {assistantMode === 'choice' && (
            <div className="space-y-4">
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#ff8b2b_0%,#ff6a00_100%)] px-5 py-5 text-white shadow-[0_20px_40px_rgba(249,115,22,0.2)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                  Start here
                </div>
                <div className="mt-2 text-2xl font-semibold leading-tight">Choose one clear next step.</div>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  Ask the chatbot if you want to know more. Choose callback only if you want our team to contact you.
                </p>
              </div>

              <button
                onClick={chooseChat}
                className="w-full rounded-[26px] bg-white px-5 py-5 text-left shadow-[0_14px_34px_rgba(249,115,22,0.12)]"
              >
                <div className="text-base font-semibold text-stone-950">Want to know more</div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  Open the chatbot and ask about courses, admissions, branches, fees guidance, or study support.
                </div>
              </button>

              <button
                onClick={chooseCall}
                className="w-full rounded-[26px] border border-orange-200 bg-[#fff9f3] px-5 py-5 text-left shadow-[0_12px_30px_rgba(249,115,22,0.08)]"
              >
                <div className="text-base font-semibold text-stone-950">Request a call</div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  Fill a simple form and our team will reach out to you directly.
                </div>
              </button>
            </div>
          )}

          {assistantMode === 'chat' && (
            <div ref={chatSectionRef} className="space-y-4">
              <div className="rounded-[24px] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(249,115,22,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-stone-950">Chatbot is ready</div>
                    <div className="text-sm text-stone-500">Ask anything and get quick help.</div>
                  </div>
                  <button
                    onClick={resetToChoice}
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div
                ref={msgsRef}
                className="max-h-[50vh] space-y-4 overflow-y-auto rounded-[26px] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(249,115,22,0.08)]"
              >
                {messages.map((msg, idx) => (
                  <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                        msg.role === 'user'
                          ? 'rounded-br-md bg-[linear-gradient(135deg,#ff8b2b_0%,#ff6a00_100%)] text-white'
                          : 'rounded-bl-md border border-orange-100 bg-[#fff9f3] text-stone-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-[20px] border border-orange-100 bg-[#fff9f3] px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400" />
                        <span
                          className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(249,115,22,0.08)]">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Quick questions
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => void handleSendMsg(question)}
                      disabled={isLoading}
                      className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-medium text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {assistantMode === 'call' && (
            <div ref={chatSectionRef} className="space-y-4">
              <div className="rounded-[24px] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(249,115,22,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-stone-950">Request a callback</div>
                    <div className="text-sm text-stone-500">Fill the form and our team will reach out.</div>
                  </div>
                  <button
                    onClick={resetToChoice}
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="space-y-4 rounded-[26px] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(249,115,22,0.08)]">
                <div className="space-y-3">
                  <input
                    className="h-12 w-full rounded-2xl border border-orange-100 bg-[#fffaf5] px-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                    placeholder="Student name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    className="h-12 w-full rounded-2xl border border-orange-100 bg-[#fffaf5] px-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                    placeholder="Phone number"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <select
                    className="h-12 w-full rounded-2xl border border-orange-100 bg-[#fffaf5] px-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                    value={leadForm.city}
                    onChange={(e) => setLeadForm((prev) => ({ ...prev, city: e.target.value }))}
                  >
                    {branchNames.map((branch) => (
                      <option key={branch}>{branch}</option>
                    ))}
                  </select>
                  <select
                    className="h-12 w-full rounded-2xl border border-orange-100 bg-[#fffaf5] px-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                    value={leadForm.cls}
                    onChange={(e) => setLeadForm((prev) => ({ ...prev, cls: e.target.value }))}
                  >
                    <option>Class 11</option>
                    <option>Class 12</option>
                    <option>Dropper</option>
                  </select>
                  <select
                    className="h-12 w-full rounded-2xl border border-orange-100 bg-[#fffaf5] px-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                    value={leadForm.course}
                    onChange={(e) => setLeadForm((prev) => ({ ...prev, course: e.target.value }))}
                  >
                    <option>IIT-JEE</option>
                    <option>NEET</option>
                    <option>Both</option>
                  </select>
                </div>

                <button
                  onClick={() => void submitLead()}
                  disabled={isSavingLead}
                  className="h-12 w-full rounded-full bg-[linear-gradient(135deg,#ff8b2b_0%,#ff6a00_100%)] text-sm font-medium text-white shadow-[0_16px_30px_rgba(249,115,22,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingLead ? 'Submitting...' : 'Submit request'}
                </button>

                <div className="rounded-[22px] border border-orange-100 bg-[#fff9f3] px-4 py-3 text-sm leading-6 text-stone-600">
                  {leadStatus || 'After submitting the form, our team will reach out shortly.'}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {assistantMode === 'chat' && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/96 p-3 shadow-[0_-12px_30px_rgba(249,115,22,0.12)] backdrop-blur">
          <div className="mx-auto max-w-[460px] space-y-3">
            <div className="flex items-center justify-between gap-3">
              {/* <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Ask from here</div>
                <div className="text-sm text-stone-600">Send your question and the chatbot will reply above.</div>
              </div> */}
              <button
                onClick={chooseCall}
                className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
              >
                Callback
              </button>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMsg();
                  }
                }}
                rows={1}
                placeholder="Ask about courses, branches, admissions..."
                disabled={isLoading}
                className="min-h-[56px] flex-1 resize-none rounded-[20px] border border-orange-100 bg-[#fffaf5] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                onClick={() => void handleSendMsg()}
                disabled={isLoading}
                className="h-14 rounded-[20px] bg-[linear-gradient(135deg,#ff8b2b_0%,#ff6a00_100%)] px-5 text-sm font-medium text-white shadow-[0_14px_24px_rgba(249,115,22,0.2)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
