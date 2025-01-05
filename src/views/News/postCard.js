import React, { useState } from 'react'
import {
  Card,
  CardBody,
  CardImg,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Button,
  Modal,
  ModalBody,
} from 'reactstrap'
import { FaEllipsisH, FaCommentDots } from 'react-icons/fa'
import Reactions from './Reactions'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import axios from 'axios'
import CommentSection from './CommentSection'

const Post = ({ post, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [text, setText] = useState('')
  const [showAllComments, setShowAllComments] = useState(false)
  const token = GetToken()
  const reactionsEmojies = ['👍', '❤️', '😋', '😂', '😮', '😢', '😡']
  const toggleModal = () => setIsModalOpen(!isModalOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const handlePreviousMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === 0 ? post.media.length - 1 : prevIndex - 1))
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === post.media.length - 1 ? 0 : prevIndex + 1))
  }

  // const handleAddComment = () => {
  //   if (newComment.trim()) {
  //     setComments([...comments, newComment])
  //     setNewComment('')
  //   }
  // }
  //adding comment
  const handleAddComment = async (postId) => {
    try {
      const response = await axios.post(
        `${BaseUrl}/posts/${postId}/comment`,
        { text, type: 'User' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      console.log('comment submitted successfully:', response.data)
    } catch (err) {
      console.error('Error submitting comment:', err)
    }
  }

  const renderMedia = () => {
    if (post.media.length === 1) {
      const item = post.media[0]
      return item.type === 'image' ? (
        <CardImg
          top
          src={item.url}
          alt="Post media"
          style={{
            objectFit: 'cover',
            width: '100%',
            maxHeight: '300px',
            cursor: 'pointer',
            paddingRight: '15px',
            paddingLeft: '15px',
          }}
          onClick={toggleModal}
        />
      ) : (
        <video
          controls
          src={item.url}
          style={{
            width: '100%',
            maxHeight: '300px',
            cursor: 'pointer',
            paddingRight: '15px',
            paddingLeft: '15px',
          }}
          onClick={toggleModal}
        />
      )
    } else if (post.media.length === 2) {
      return (
        <div style={{ display: 'flex' }}>
          {post.media.map((item, index) =>
            item.type === 'image' ? (
              <CardImg
                key={index}
                src={item.url}
                alt={`Media ${index + 1}`}
                style={{
                  objectFit: 'cover',
                  width: '50%',
                  cursor: 'pointer',
                  maxHeight: '300px',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                }}
                onClick={() => {
                  setCurrentMediaIndex(index)
                  toggleModal()
                }}
              />
            ) : (
              <video
                key={index}
                controls
                src={item.url}
                style={{
                  width: '50%',
                  cursor: 'pointer',
                  maxHeight: '300px',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                }}
                onClick={() => {
                  setCurrentMediaIndex(index)
                  toggleModal()
                }}
              />
            ),
          )}
        </div>
      )
    } else {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
          {post.media.slice(0, 4).map((item, index) =>
            item.type === 'image' ? (
              <CardImg
                key={index}
                src={item.url}
                alt={`Media ${index + 1}`}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  cursor: 'pointer',
                  maxHeight: '200px',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                }}
                onClick={() => {
                  setCurrentMediaIndex(index)
                  toggleModal()
                }}
              />
            ) : (
              <video
                key={index}
                controls
                src={item.url}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  maxHeight: '200px',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                }}
                onClick={() => {
                  setCurrentMediaIndex(index)
                  toggleModal()
                }}
              />
            ),
          )}
          {post.media.length > 4 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={toggleModal}
            >
              +{post.media.length - 4}
            </div>
          )}
        </div>
      )
    }
  }
  const handleAddReply = async (commentId, replyText) => {
    try {
      const response = await axios.post(
        `${BaseUrl}/posts/${post._id}/reply/${commentId}`,
        { text:replyText, type: 'User' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      console.log('Replay submitted successfully:', response.data)
    } catch (err) {
      console.error('Error submitting reply:', err)
    }
  }

  return (
    <Card style={{ margin: 'auto', marginBottom: '20px', maxWidth: '800px' }}>
      <CardBody style={{ position: 'relative', paddingBottom: '0' }}>
        <p>{post.summary}</p>
        <ButtonDropdown
          isOpen={dropdownOpen}
          toggle={toggleDropdown}
          style={{ position: 'absolute', top: '10px', right: '10px' }}
        >
          <DropdownToggle color="link" style={{ padding: '0' }}>
            <FaEllipsisH />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={onEdit}>Edit</DropdownItem>
            <DropdownItem onClick={onDelete}>Delete</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </CardBody>

      {post.media && post.media.length > 0 && renderMedia()}

      <CardBody>
        <span style={{ cursor: 'pointer', marginTop: '7px' }}>
          {' '}
          {post.comments.length} Comments
        </span>

        <div style={{ marginTop: '20px' }}>
          <CommentSection
            post={post}
            handleAddComment={handleAddComment}
            handleAddReply={handleAddReply}
          />
        </div>
      </CardBody>

      <div
        style={{
          padding: '10px',
          borderTop: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            cursor: 'pointer',
            flex: '1', // Takes 1/4 of the space
            maxWidth: '25%', // Ensures it doesn’t exceed 25%
            marginLeft: '8%',
          }}
        >
          <Reactions />
        </span>
        <div
          style={{
            position: 'relative',
            flex: '3', // Takes 3/4 of the space
            maxWidth: '75%', // Ensures it doesn’t exceed 75%
          }}
        >
          <Input
            type="text"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%', // Ensures the input takes up the available width
              boxSizing: 'border-box', // Prevents overflow issues
            }}
          />
          <FaCommentDots
            size={20}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#007bff',
            }}
            onClick={() => {
              handleAddComment(post._id)
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalBody style={{ position: 'relative', textAlign: 'center' }}>
            <Button
              style={{ position: 'absolute', top: '50%', left: '5%' }}
              onClick={handlePreviousMedia}
            >
              Previous
            </Button>
            {post.media[currentMediaIndex].type === 'image' ? (
              <img
                src={post.media[currentMediaIndex].url}
                alt="Fullscreen Media"
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
            ) : (
              <video controls style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                <source src={post.media[currentMediaIndex].url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <Button
              style={{ position: 'absolute', top: '50%', right: '5%' }}
              onClick={handleNextMedia}
            >
              Next
            </Button>
          </ModalBody>
        </Modal>
      )}
    </Card>
  )
}

export default Post
