import React from 'react';

/**
 * Message component displays a chat message with styling based on sender.
 * @param {Object} props - Component props
 * @param {string} props.text - The message text content
 * @param {'user'|'bot'} props.sender - Identifies who sent the message (affects styling)
 */
export default function Message({ text, sender }) {
    return (
        <div className={`message ${sender}`}>
            {/* 
               message-content wrapper ensures consistent styling
               split('\n') handles multi-line messages by creating separate <p> tags
               for each line break in the input text 
            */}
            <div className="message-content">
                {text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
}