import React, { useState, useRef } from 'react'
import './Reactions.css'
import { FaThumbsUp } from 'react-icons/fa'

const reactionsEmojies = ['👍', '❤️', '😋', '😂', '😮', '😢', '😡']

const Reactions = () => {
  const [showReactions, setShowReactions] = useState(false)
  const touchTimeout = useRef(null)

  // Handle long press for mobile devices
  const handleTouchStart = () => {
    touchTimeout.current = setTimeout(() => {
      setShowReactions(true)
    }, 500) // 500ms for a long press
  }

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current)
    }
  }

  const handleReactionClick = (emoji) => {
    console.log(`You clicked on: ${emoji}`)
    setShowReactions(false) // Hide reactions after clicking one
  }

  return (
    <div
      className="reactions-container"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <button className="like-button" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <FaThumbsUp /> like
      </button>
      {showReactions && (
        <div className="reactions-popup">
          {reactionsEmojies.map((emoji, index) => (
            <span key={index} className="reaction-emoji" onClick={() => handleReactionClick(emoji)}>
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reactions
