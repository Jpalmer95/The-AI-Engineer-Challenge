"use client"; // This is a client component

import Image from "next/image";
import { useState } from "react";
import SettingsModal from "../components/SettingsModal"; // Import the new component

interface Message {
  text: string;
  sender: "user" | "robot";
}

interface AssistantMessage {
  text: string;
}

const applyMatrixEffect = (text: string) => {
  return text.split("").map((char, i) => {
    if (Math.random() < 0.1) { // 10% chance for a character to be colored
      const randomColor = Math.random() < 0.5 ? "text-red-500" : "text-blue-500";
      return (
        <span key={i} className={randomColor}>
          {char}
        </span>
      );
    }
    return char;
  });
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([{ text: "Hello! I am your AI assistant." }]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for modal visibility

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: "user" } as Message;
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");

      // Get settings from localStorage
      const userHfToken = localStorage.getItem('hf_token');
      const mainModel = localStorage.getItem('main_model') || 'HuggingFaceTB/SmolLM3-3B';
      const assistantModel = localStorage.getItem('assistant_model') || 'HuggingFaceTB/SmolLM3-3B';

      // Function to call the backend API and handle streaming
      const streamApiResponse = async (
        model: string,
        developerMessage: string,
        userMessage: string,
        onChunk: (text: string) => void,
        onError: (error: string) => void
      ) => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              developer_message: developerMessage,
              user_message: userMessage,
              model: model,
              hf_token: userHfToken,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get response reader");
          }
          const decoder = new TextDecoder();
          let receivedText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedText += decoder.decode(value, { stream: true });
            onChunk(receivedText);
          }
        } catch (error: unknown) {
          console.error("Backend API Error:", error);
          if (error instanceof Error) {
            onError(error.message);
          } else {
            onError("An unknown error occurred");
          }
        }
      };

      // Main chat AI response
      setMessages((prevMessages) => [...prevMessages, { text: "Processing...", sender: "robot" }]);
      streamApiResponse(
        mainModel,
        "You are a helpful AI assistant in a corrupt terminal.",
        input,
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { text: chunk, sender: "robot" };
            return newMessages;
          });
        },
        (error) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { text: `Error: ${error}`, sender: "robot" };
            return newMessages;
          });
        }
      );

      // Assistant chat AI response
      setAssistantMessages((prev) => [...prev, { text: "Thinking..." }]);
      streamApiResponse(
        assistantModel,
        "You are a helpful AI assistant providing concise logs.",
        input,
        (chunk) => {
          setAssistantMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { text: chunk };
            return newMessages;
          });
        },
        (error) => {
          setAssistantMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { text: `Error: ${error}` };
            return newMessages;
          });
        }
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-green-400 font-mono">
      {/* Robot Image Section */}
      <div className="md:w-1/3 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-900 to-black border-r border-green-700 relative">
        <Image
          src="/robot.png" // Placeholder for robot image
          alt="Robot Assistant"
          width={300}
          height={300}
          className="rounded-full border-4 border-green-500 shadow-lg shadow-green-500/50 mb-8"
        />
        {/* Small Inline Chatbox for Assistant */}
        <div className="absolute bottom-8 w-3/4 bg-gray-950 rounded-lg border border-green-700 p-4 shadow-inner shadow-green-500/20">
          <h3 className="text-lg font-bold text-green-400 mb-2">Assistant Log:</h3>
          <div className="h-24 overflow-y-auto text-sm text-green-300">
            {assistantMessages.map((msg, index) => (
              <div key={index} className="mb-1">
                {applyMatrixEffect(msg.text)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface Section */}
      <div className="md:w-2/3 flex flex-col p-8 bg-black relative"> {/* Added relative for positioning */}
        <h1 className="text-4xl font-bold text-green-400 mb-8 text-center drop-shadow-[0_0_5px_rgba(0,255,0,0.7)]">
          Corrupt Terminal
        </h1>
        {/* Settings Button */}
        <button
          className="absolute top-8 right-8 text-green-400 hover:text-green-300 focus:outline-none"
          onClick={() => setIsSettingsModalOpen(true)}
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.325-1.119-1.353-1.917-2.567-1.917-1.214 0-2.242.798-2.567 1.917a1.5 1.5 0 00-1.483 1.277L3.17 6.513A1.5 1.5 0 002 7.824v4.352c0 .73.59 1.32 1.32 1.32h1.267a1.5 1.5 0 001.483 1.277c.325 1.119 1.353 1.917 2.567 1.917 1.214 0 2.242-.798 2.567-1.917a1.5 1.5 0 001.483-1.277h1.267c.73 0 1.32-.59 1.32-1.32V7.824a1.5 1.5 0 00-1.17-1.311l-1.267-.223a1.5 1.5 0 00-1.483-1.277zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-950 rounded-lg border border-green-700 shadow-inner shadow-green-500/20">
          {messages.length === 0 ? (
            <div className="text-center text-green-600">
              <span className="animate-pulse">_</span> Initializing AI...
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-3 rounded-lg border ${
                    msg.sender === "user"
                      ? "bg-green-800 border-green-600 text-green-200"
                      : "bg-gray-800 border-green-700 text-green-400"
                  }`}
                >
                  {applyMatrixEffect(msg.text)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Message Input Area */}
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-3 rounded-l-lg bg-gray-900 text-green-400 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 caret-green-400"
            placeholder="Type your command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button
            className="bg-green-700 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-r-lg transition duration-300 ease-in-out border border-green-500"
            onClick={handleSendMessage}
          >
            SEND
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
