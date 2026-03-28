"use client";

import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 Welcome to Dhonik Bharti Assistant! Ask me about courses, fees, admissions, and more." },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "Courses & fees",
    "How to join?",
    "NEET date",
    "About Director",
    "Branches",
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data?.error;
        const errMsg = typeof err === "string" ? err : JSON.stringify(err || "Something went wrong");
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: `Error: ${errMsg}` },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't send your message. Please try again." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-[400px] h-[600px] bg-gray-900 shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-orange-500">
      
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 font-bold">
        <h2 className="text-lg">Dhonik Bharti Assistant</h2>
        <p className="text-sm font-light">IIT-JEE & NEET Integrated Coaching</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                msg.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-white border border-orange-400"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-2 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-3 rounded transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about admissions, courses..."
          className="flex-1 border border-orange-500 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <button
          onClick={() => sendMessage()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}