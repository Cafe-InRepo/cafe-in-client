import React, { useState } from 'react';
import { Input, Button } from 'reactstrap';

const CommentSection = ({ post, handleAddReply }) => {
  const [replyText, setReplyText] = useState('');
  const [activeReplyInput, setActiveReplyInput] = useState(null); // Tracks which comment's reply input is visible
  const [visibleComments, setVisibleComments] = useState(2); // Tracks number of visible comments

  const renderReplies = (replies) => {
    return replies.map((reply, index) => (
      <div
        key={index}
        style={{
          marginLeft: '20px',
          borderLeft: '2px solid #ccc',
          paddingLeft: '10px',
          marginTop: '10px',
        }}
      >
        <div>
          <strong>{reply.author.id}:</strong> {reply.text}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'gray' }}>
          {new Date(reply.createdAt).toLocaleString()}
        </div>
      </div>
    ));
  };

  const renderComments = () => {
    return post.comments.slice(0, visibleComments).map((comment, index) => (
      <div
        key={index}
        style={{
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid #ccc',
        }}
      >
        <div>
          <strong>{comment.authorDetails.fullName}:</strong> {comment.text}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'gray' }}>
          {new Date(comment.createdAt).toLocaleString()}
        </div>
        <Button
          size="sm"
          color="link"
          style={{ fontSize: '0.8rem', marginTop: '5px' }}
          onClick={() =>
            setActiveReplyInput(activeReplyInput === index ? null : index)
          }
        >
          Reply
        </Button>

        {/* Show reply input only for the active comment */}
        {activeReplyInput === index && (
          <div style={{ marginTop: '10px', marginLeft: '20px' }}>
            <Input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                marginBottom: '10px',
                borderRadius: '10px',
                padding: '10px',
              }}
            />
            <Button
              color="primary"
              size="sm"
              onClick={() => {
                handleAddReply(comment._id, replyText); // Pass comment ID and reply text
                setReplyText(''); // Clear reply input
                setActiveReplyInput(null); // Hide reply input
              }}
            >
              Submit Reply
            </Button>
          </div>
        )}

        {comment.replies && renderReplies(comment.replies)}
      </div>
    ));
  };

  return (
    <div>
      {renderComments()}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {visibleComments < post.comments.length ? (
          <Button
            color="link"
            size="sm"
            onClick={() => setVisibleComments(post.comments.length)}
          >
            Show More
          </Button>
        ) : (
          post.comments.length > 2 && (
            <Button
              color="link"
              size="sm"
              onClick={() => setVisibleComments(2)}
            >
              Show Less
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default CommentSection;
