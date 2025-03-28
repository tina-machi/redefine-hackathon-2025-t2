import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Message from './Message';

/**
 * Chat component that provides career mentoring for young women
 * Features:
 * - Maintains full conversation history with context awareness
 * - Integrates with Google's Gemini AI for intelligent responses
 * - Auto-scrolls to keep newest messages visible
 * - Challenges gender stereotypes in career guidance
 * - Uses friendly, encouraging language with emoji support
 * - Text-to-speech functionality for AI responses
 */
export default function Chat() {
    // State for storing all chat messages (starts with welcome message)
    const [messages, setMessages] = useState([
        {
            text: "Hi! I'm your Career Fairy 🧚‍♀️. Ask me about any profession (e.g. engineering, nursing, etc.)",
            sender: 'bot'
        }
    ]);
    // State for tracking current user input
    const [input, setInput] = useState('');
    // Ref for auto-scrolling to the latest message
    const messagesEndRef = useRef(null);
    // State for managing text-to-speech feature
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

    // Function to remove emojis from text
    const removeEmojis = (text) => {
        return text.replace(
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
            ''
        ).trim();
    };

    // Function to handle text-to-speech for the AI response
    const speak = (text) => {
        if (isSpeechEnabled && 'speechSynthesis' in window) {
            const cleanText = removeEmojis(text); // Remove emojis first
            if (!cleanText) return; // Skip if empty after removal
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05; // Slightly slower pace
            utterance.pitch = 1.3; // Slightly higher pitch
            window.speechSynthesis.speak(utterance);
        }
    };

    // Function to scroll to the bottom of the chat
    // This ensures the latest messages are always visible
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect to auto-scroll to the latest message whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Call the AI response function
        try {
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            // Build complete conversation history for context awareness
            const recentHistory = messages.map(msg =>
                `${msg.sender === 'user' ? 'User' : 'Mentor'}: ${msg.text}`
            ).join('\n');

            /**
             * Carefully crafted prompt to guide AI responses:
             * 1. Provides full conversation context
             * 2. Includes detailed response guidelines
             * 3. Maintains consistent mentoring persona
             */
            const prompt = `
            You are a supportive career mentor helping young women explore professions. 
            Maintain conversation context from this chat history:
            ${recentHistory}
            
            Current question: ${input}
            
            Guidelines:
            1. Remember the current profession being discussed
            2. For follow-up questions without specifics, continue the last topic
            3. Challenge gender stereotypes by:
                - Normalizing their interest
                - Highlighting diverse women in the field
                - Providing actionable steps
            4. Keep responses detailed but concise (3-5 sentences)
            5. Never reveal you're an AI
            6. Focus on opportunities, not obstacles
            7. Avoid jargon and complex terms, use simple language
            8. Use a friendly, conversational tone
            9. Be supportive and encouraging
            10. Avoid overly technical details
            11. Use emojis to enhance engagement
            12. If a new profession is mentioned, provide a brief overview
            
            Example Flow:
            User: Tell me about engineering
            Mentor: Engineering lets you solve real-world problems! Women like...
            User: What math is needed?
            Mentor: For engineering, focus on algebra and calculus...`;

            // Generate AI response using the prompt
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { text, sender: 'bot' }]);
            speak(text);
        } catch (error) {
            // Handle any errors from the AI call
            setMessages(prev => [...prev, {
                text: "Oops! I encountered an error. Please try again later.",
                sender: 'bot'
            }]);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, i) => (
                    <Message key={i} text={msg.text} sender={msg.sender} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a career..."
                />
                <button
                    type="button"
                    className="speech-toggle"
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    aria-label={isSpeechEnabled ? "Mute speech" : "Enable speech"}
                >
                    {isSpeechEnabled ? (
                        <span role="img" aria-label="Mute">🔊</span>
                    ) : (
                        <span role="img" aria-label="Unmute">🔇</span>
                    )}
                </button>
                <button type="submit">Send</button>
            </form>
        </div>
    );
}



