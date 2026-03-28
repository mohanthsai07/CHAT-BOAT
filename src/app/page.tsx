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

const trustPoints = [
  'IIT-JEE integrated coaching',
  'NEET integrated coaching',
  'Mentored founding batch',
  'Four active branches',
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
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, assistantMode, isLoading]);

  const appendBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
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

    setMessages((prev) => [...prev, { role: 'user', text: msgText }]);
    setInput('');
    setIsLoading(true);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,130,32,0.16),_transparent_34%),linear-gradient(180deg,#f9f6f1_0%,#f4efe7_46%,#efe8de_100%)] text-stone-950">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-[rgba(249,246,241,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold tracking-[0.32em] text-orange-400 shadow-[0_16px_40px_rgba(24,24,27,0.25)]">
              DB
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-stone-500">
                The Lloyd Group
              </div>
              <div className="text-lg font-semibold text-stone-950">Dhanik Bharat</div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="https://wa.me/919555825559"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-400 hover:text-stone-950"
            >
              WhatsApp
            </a>
            <a
              href="tel:9555825559"
              className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500"
            >
              Call admissions
            </a>
          </div>

          <div className="flex w-full gap-3 md:hidden">
            <a
              href="https://wa.me/919555825559"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-center text-sm font-medium text-stone-700 transition hover:border-orange-400 hover:text-stone-950"
            >
              WhatsApp
            </a>
            <a
              href="tel:9555825559"
              className="flex-1 rounded-full bg-stone-950 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-orange-500"
            >
              Call now
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-stone-950 px-5 py-7 text-white shadow-[0_24px_80px_rgba(28,25,23,0.28)] sm:rounded-[32px] sm:px-8 sm:py-10">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.34),_transparent_56%)]" />
            <div className="absolute -right-16 top-0 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
            <div className="relative space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-orange-300">
                  Founded 2025 | Integrated academic system
                </div>
                <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
                  A premium admissions experience for serious IIT-JEE and NEET aspirants.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                  Explore programs, compare branches, understand our Pomodoro learning method, or request
                  a callback from the admissions team in one clean guided flow.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {trustPoints.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-orange-400/30 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-100"
                  >
                    {point}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-[28px] sm:p-5 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-400">Upcoming exam</div>
                  <div className="mt-2 text-2xl font-semibold text-orange-300">NEET UG</div>
                  <div className="text-sm text-stone-300">May 3, 2026</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-400">Upcoming exam</div>
                  <div className="mt-2 text-2xl font-semibold text-orange-300">JEE Advanced</div>
                  <div className="text-sm text-stone-300">May 18, 2026</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-400">Support</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-300">24/7</div>
                  <div className="text-sm text-stone-300">WhatsApp and callback desk</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_18px_55px_rgba(82,63,20,0.09)] backdrop-blur sm:rounded-[28px] sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Director</div>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-base font-semibold text-white">
                  BM
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-stone-950">Smt. Balalatha Mallavarapu</h2>
                  <p className="text-sm leading-6 text-stone-600">
                    Former Deputy Director, Ministry of Defence and a two-time Civil Services ranker guiding
                    the founding batch personally.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-[#fffdf9] p-5 shadow-[0_18px_55px_rgba(82,63,20,0.08)] sm:rounded-[28px] sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Branch network</div>
              <div className="mt-4 grid gap-3">
                {branchNames.map((branch) => (
                  <div
                    key={branch}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
                  >
                    <span>{branch}</span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-700">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/85 shadow-[0_24px_90px_rgba(96,74,32,0.12)] backdrop-blur sm:rounded-[32px]">
            <div className="border-b border-stone-200 bg-[linear-gradient(135deg,#19130d_0%,#2f1806_55%,#f97316_180%)] px-4 py-5 text-white sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold tracking-[0.3em] text-orange-200">
                  DB
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">Concierge assistant</div>
                  <div className="text-sm text-stone-300">
                    Start with a guided choice, then move into live information or callback support.
                  </div>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-200">
                  Online
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
              <div className="flex min-h-[480px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#f8f4ee_100%)] sm:min-h-[560px]">
                <div ref={msgsRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                  {messages.map((msg, idx) => (
                    <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[92%] rounded-[20px] px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[85%] sm:rounded-[22px] ${
                          msg.role === 'user'
                            ? 'rounded-br-md bg-stone-950 text-white'
                            : 'rounded-bl-md border border-stone-200 bg-white text-stone-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {assistantMode === 'choice' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={chooseChat}
                        className="rounded-[22px] border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md sm:rounded-[24px]"
                      >
                        <div className="text-sm font-semibold text-stone-950">Want to know more</div>
                        <div className="mt-2 text-sm leading-6 text-stone-600">
                          Explore courses, fees guidance, admissions, branches, study method, and exam support.
                        </div>
                      </button>
                      <button
                        onClick={chooseCall}
                        className="rounded-[22px] border border-orange-200 bg-orange-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-100/70 hover:shadow-md sm:rounded-[24px]"
                      >
                        <div className="text-sm font-semibold text-stone-950">Request a call</div>
                        <div className="mt-2 text-sm leading-6 text-stone-600">
                          Leave your details and our team will call back with program, branch, and admission help.
                        </div>
                      </button>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 shadow-sm">
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

                <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
                  {assistantMode === 'chat' ? (
                    <>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {quickQuestions.map((question) => (
                          <button
                            key={question}
                            onClick={() => void handleSendMsg(question)}
                            disabled={isLoading}
                            className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {question}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              void handleSendMsg();
                            }
                          }}
                          placeholder="Type your question here"
                          disabled={isLoading}
                          className="h-12 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            onClick={() => void handleSendMsg()}
                            disabled={isLoading}
                            className="h-12 rounded-full bg-stone-950 px-5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Ask now
                          </button>
                          <button
                            onClick={resetToChoice}
                            className="h-12 rounded-full border border-stone-200 px-5 text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                      <span>Select one of the guided options above to continue.</span>
                      {assistantMode !== 'choice' && (
                        <button
                          onClick={resetToChoice}
                          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400"
                        >
                          Start over
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <aside className="border-t border-stone-200 bg-[#fffaf4] p-5 sm:p-6 lg:border-l lg:border-t-0">
                {assistantMode === 'call' ? (
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                        Callback request
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold text-stone-950">Request a personal call</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        Share a few details and our admissions team will reach out with the right course and branch guidance.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400"
                        placeholder="Student name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                      <input
                        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400"
                        placeholder="Phone number"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                      <select
                        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, city: e.target.value }))}
                      >
                        {branchNames.map((branch) => (
                          <option key={branch}>{branch}</option>
                        ))}
                      </select>
                      <select
                        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400"
                        value={leadForm.cls}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, cls: e.target.value }))}
                      >
                        <option>Class 11</option>
                        <option>Class 12</option>
                        <option>Dropper</option>
                      </select>
                      <select
                        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400"
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
                      className="h-12 w-full rounded-full bg-stone-950 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingLead ? 'Saving request...' : 'Request callback'}
                    </button>

                    <div className="rounded-[22px] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-600">
                      {leadStatus || 'Your details stay private and are sent only to our admissions sheet.'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                        Quick contact
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold text-stone-950">Admissions desk</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        Fast human help is available if you want branch support, fee guidance, or admission counselling.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <a
                        href="https://wa.me/919555825559"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-[22px] border border-stone-200 bg-white px-4 py-4 transition hover:border-orange-300 hover:shadow-sm"
                      >
                        <div>
                          <div className="text-sm font-semibold text-stone-950">WhatsApp support</div>
                          <div className="text-sm text-stone-600">9555825559</div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Live
                        </span>
                      </a>
                      <a
                        href="tel:9555825559"
                        className="flex items-center justify-between rounded-[22px] border border-stone-200 bg-white px-4 py-4 transition hover:border-orange-300 hover:shadow-sm"
                      >
                        <div>
                          <div className="text-sm font-semibold text-stone-950">Primary call line</div>
                          <div className="text-sm text-stone-600">9555825559</div>
                        </div>
                        <span className="text-sm font-medium text-orange-600">Call</span>
                      </a>
                      <a
                        href="tel:7032305559"
                        className="flex items-center justify-between rounded-[22px] border border-stone-200 bg-white px-4 py-4 transition hover:border-orange-300 hover:shadow-sm"
                      >
                        <div>
                          <div className="text-sm font-semibold text-stone-950">Alternate line</div>
                          <div className="text-sm text-stone-600">7032305559</div>
                        </div>
                        <span className="text-sm font-medium text-orange-600">Call</span>
                      </a>
                    </div>

                    <div className="rounded-[24px] bg-stone-950 px-5 py-5 text-white">
                      <div className="text-xs uppercase tracking-[0.26em] text-orange-300">Why students choose us</div>
                      <div className="mt-3 text-lg font-semibold">Focused guidance, strong structure, and responsive support.</div>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        Students can start with information discovery and move into a callback request only when they are ready.
                      </p>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_55px_rgba(82,63,20,0.08)] sm:rounded-[28px] sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Learning model</div>
              <h3 className="mt-3 text-2xl font-semibold text-stone-950">Pomodoro-led discipline</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Our learning rhythm is built around focused 25-minute sessions, short recovery breaks, and a sustainable study pace that improves consistency without burnout.
              </p>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_55px_rgba(82,63,20,0.08)] sm:rounded-[28px] sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Admissions path</div>
              <ol className="mt-4 space-y-4 text-sm text-stone-700">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    1
                  </span>
                  <span>Start with a chat question or request a personal callback.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    2
                  </span>
                  <span>Receive counselling on branch, course path, and admission fit.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    3
                  </span>
                  <span>Complete the admission form and confirm your seat.</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <footer className="border-t border-stone-200/80 px-1 pt-6 text-sm text-stone-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>2026 Dhanik Bharat Educational Institutions. Built for a polished admissions experience.</span>
            <a
              href="https://wa.me/919555825559"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-orange-600 transition hover:text-orange-700"
            >
              WhatsApp the team
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
