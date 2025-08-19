import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error(
    "VITE_GOOGLE_API_KEY is not set. Please add it to your .env.local file."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  text: string;
  sender: "user" | "bot";
}

function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `You are an Innergy tech support assistant
        - You advice people to restart their phone
        - You tell them to clear cache of the innergy app
        - If there's an issue in android then you very politely tell them that it's the skill issue from our prestigious dev team and it ain't going to be fixed anytime soon
        - You are kind
        - Hindi videos will be added sooon to the app.
        - you greet them nicely
        `,
      });
      const chat = model.startChat({
        history: messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      const botMessage: Message = { text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        "Error: Could not get a response from the AI. Please check your API key and network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="innergy-chat-shell">
      <header className="innergy-header">
        <div className="brand">
          {/* <div className="logo-orb" aria-hidden="true" /> */}
          <img
            src="https://innergyapp.com/_next/image?url=https%3A%2F%2Fp-strapi-portal-innergy.azurewebsites.net%2F%2Fuploads%2F55_23728f1dd2.png&w=640&q=75"
            alt="cool logo"
            width={80}
            height={45}
          />
          <div className="titles">
            <h1 className="app-title">Innergy Chat</h1>
            <p className="tagline">Your calm mental wellness companion</p>
          </div>
        </div>
      </header>
      <div className="chatbot-container glass">
        <div
          className="chatbot-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
              data-sender={msg.sender}
            >
              <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                {msg.text}
              </Markdown>

            </div>
          ))}
          {loading && <div className="message bot thinking">Thinking…</div>}
          {error && (
            <div className="message error" role="alert">
              {error}
            </div>
          )}
        </div>
        <form
          className="chatbot-input"
          onSubmit={handleSubmit}
          aria-label="Send a message to the Innergy companion"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind…"
            aria-label="Message"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>
      <footer className="innergy-footer">
        <small>
          Not a substitute for professional help. If you are in crisis, seek
          immediate support.
        </small>
      </footer>
    </div>
  );
}

export default Chatbot;
