import React, { useState } from 'react';

const emojis = [
    '😀', '😂', '😍', '🥺', '😎', '😢', '😡', '🥳', '😜', '😎',
    '🤔', '🙌', '👏', '🥂', '🍻', '💪', '👍', '👎', '🙏', '🎉'
];

const EmojiPicker = ({ onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleEmojiClick = (emoji) => {
        onEmojiSelect(emoji);
        setShowPicker(false);
    };

    return (
        <div>
            <button className="btn btn-light" onClick={() => setShowPicker(!showPicker)}>
                <i className="bi bi-emoji-smile"></i>
            </button>
            {showPicker && (
                <div className="emoji-picker" style={{ position: 'absolute', bottom: '56px', right: '0', zIndex: '1000', border: '1px solid #ddd', backgroundColor: '#fff', padding: '10px', borderRadius: '5px' }}>
                    {emojis.map((emoji, index) => (
                        <span
                            key={index}
                            style={{ fontSize: '24px', cursor: 'pointer', margin: '5px' }}
                            onClick={() => handleEmojiClick(emoji)}
                        >
                            {emoji}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmojiPicker;
