'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import useStore from '@/app/store/store'
import Image from 'next/image'
import { FaComment, FaReply, FaHeart, FaCalendarAlt, FaArrowLeft, FaInstagram, FaPlay } from 'react-icons/fa'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function PostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchInstagramComments, replyToInstagramComment } = useStore()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyStatus, setReplyStatus] = useState(null)
  
  const postId = params.id
  const accessToken = searchParams.get('access_token')
  const igUserId = searchParams.get('ig_user_id')
  
  useEffect(() => {
    try {
      const storedPost = localStorage.getItem(`post_${postId}`)
      if (storedPost) {
        setPost(JSON.parse(storedPost))
        setLoading(false)
      } else {
        setError('Post not found')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error retrieving post data:', err)
      setError('Failed to load post data')
      setLoading(false)
    }
  }, [postId])
  
  useEffect(() => {
    if (post && accessToken) {
      loadComments(post.id)
    }
  }, [post, accessToken])
  
  const loadComments = async (mediaId) => {
    try {
      const data = await fetchInstagramComments(mediaId, accessToken)
      setComments(data.data || [])
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }
  
  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId)
    setReplyText('')
    setReplyStatus(null)
  }
  
  const submitReply = async (commentId) => {
    if (!replyText.trim()) return
    
    try {
      setReplyStatus({ loading: true })
      await replyToInstagramComment(commentId, replyText, accessToken)
      setReplyText('')
      setReplyingTo(null)
      setReplyStatus({ success: true, message: 'Reply posted successfully!' })
      await loadComments(post.id)
    } catch (err) {
      console.error('Failed to post reply:', err)
      setReplyStatus({ error: true, message: 'Failed to post reply. Please try again.' })
    }
  }
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212]">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 15,
            mass: 1.2
          }}
          className="relative mb-12"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"></div>
          <h1 className="relative text-white text-4xl font-black font-rubik tracking-wider px-8 py-4 bg-[#1a1a1a] border-4 border-[#ff00ff] rounded-lg shadow-[8px_8px_0px_0px_#ff00ff] rotate-1">
            {[..."LOADING..."].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 800,
                  damping: 10
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </motion.div>
        <motion.div 
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "linear" 
          }}
          className="h-20 w-20 border-8 border-t-[#FF3366] border-r-[#00CCFF] border-b-[#FFDE59] border-l-[#33FF99] rounded-full"
        />
      </div>
    )
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-[#121212]"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1E1E1E] p-8 rounded-xl shadow-2xl max-w-md border-2 border-[#333] shadow-[8px_8px_0px_0px_rgba(51,51,51,0.3)]"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3, repeatType: "reverse" }}
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-900"
          >
            <span className="text-red-300 text-3xl">!</span>
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Error</h2>
          <p className="text-gray-300 text-center">{error}</p>
          <motion.button
            whileHover={{ translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full py-2 px-4 bg-[#FF3366] text-white rounded-lg font-medium border-2 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(204,41,82,0.3)] cursor-pointer"
            onClick={() => router.push(`/details?ig_user_id=${igUserId}&access_token=${accessToken}`)}
          >
            Return to Gallery
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }
  
  if (!post) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-[#121212]"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1E1E1E] p-8 rounded-xl shadow-2xl max-w-md border-2 border-[#333] shadow-[8px_8px_0px_0px_rgba(51,51,51,0.3)]"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3, repeatType: "reverse" }}
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#FFDE59]"
          >
            <span className="text-[#121212] text-3xl">?</span>
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Post Not Found</h2>
          <p className="text-gray-300 text-center">The requested post could not be found.</p>
          <motion.button
            whileHover={{ translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full py-2 px-4 bg-[#00CCFF] text-white rounded-lg font-medium border-2 border-[#0099CC] shadow-[4px_4px_0px_0px_rgba(0,153,204,0.3)] cursor-pointer"
            onClick={() => router.push(`/details?ig_user_id=${igUserId}&access_token=${accessToken}`)}
          >
            Return to Gallery
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-[#1E1E1E] p-6 rounded-xl shadow-2xl border-2 border-[#333] shadow-[8px_8px_0px_0px_rgba(51,51,51,0.3)]"
      >
        <motion.button
          whileHover={{ translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 inline-flex items-center gap-2 bg-[#FF3366] text-white py-2 px-4 rounded-lg font-medium border-2 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(204,41,82,0.3)] cursor-pointer"
          onClick={() => router.push(`/details?ig_user_id=${igUserId}&access_token=${accessToken}`)}
        >
          <FaArrowLeft /> Back to Gallery
        </motion.button>
        
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`md:w-1/2 ${post.media_type === 'VIDEO' ? 'aspect-[9/16] md:h-[600px]' : 'aspect-square md:h-[400px]'}`}
          >
            {post.media_type === 'VIDEO' ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-[#00CCFF] shadow-[8px_8px_0px_0px_#0099CC]">
                <video 
                  src={post.media_url} 
                  controls 
                  className="w-full h-full object-cover bg-black/5 cursor-pointer"
                  poster={post.thumbnail_url}
                />
                <div className="absolute top-2 right-2 bg-[#00CCFF] text-[#121212] text-sm px-3 py-1 rounded-full font-bold border-2 border-[#0099CC]">
                  Reel
                </div>
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100"
                >
                  <div className="bg-[#FF3366] rounded-full p-4 border-2 border-[#CC2952]">
                    <FaPlay className="text-white text-2xl" />
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-[#FFDE59] shadow-[8px_8px_0px_0px_#CCAF47]">
                <Image 
                  src={post.media_url} 
                  alt={post.caption || 'Instagram post'} 
                  fill
                  className="object-contain bg-black/5 cursor-pointer"
                />
                <div className="absolute top-2 right-2 bg-[#FFDE59] text-[#121212] text-sm px-3 py-1 rounded-full font-bold border-2 border-[#CCAF47]">
                  {post.media_type === 'CAROUSEL_ALBUM' ? 'Album' : 'Image'}
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:w-1/2"
          >
            <div className="mb-4 p-4 bg-[#2A2A2A] rounded-lg border-2 border-[#444] shadow-[4px_4px_0px_0px_rgba(68,68,68,0.3)]">
              <div className="flex items-center gap-2 text-gray-300 font-medium mb-2">
                <FaCalendarAlt className="text-[#00CCFF]" />
                <span>{formatDate(post.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <FaHeart className="text-2xl text-[#FF3366]" />
                <span className="text-xl">{post.like_count || 0} likes</span>
              </div>
              <div className="mt-3">
                <motion.a 
                  whileHover={{ translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FF3366] text-white py-2 px-4 rounded-lg font-medium border-2 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(204,41,82,0.3)] cursor-pointer"
                >
                  <FaInstagram className="text-xl" /> View on Instagram
                </motion.a>
              </div>
            </div>
            
            {post.caption && (
              <div className="mb-6 p-4 bg-[#2A2A2A] rounded-lg border-2 border-[#444] shadow-[4px_4px_0px_0px_rgba(68,68,68,0.3)]">
                <p className="text-gray-300 font-medium">{post.caption}</p>
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <FaComment className="text-[#00CCFF]" />
              Comments ({comments.length})
            </h3>
            
            <AnimatePresence>
              {replyStatus && !replyStatus.loading && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-4 p-3 rounded-lg ${replyStatus.error ? 'bg-[#FF3366] text-white border-2 border-[#CC2952]' : 'bg-[#33FF99] text-[#121212] border-2 border-[#2ACC7A]'}`}
                >
                  <p className="font-medium">{replyStatus.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-2 bg-[#2A2A2A] rounded-lg border-2 border-[#444]">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <motion.div 
                    key={comment.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#333] p-4 rounded-lg border-2 border-[#444] shadow-[4px_4px_0px_0px_rgba(68,68,68,0.3)]"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-white">{comment.username}</p>
                      <span className="text-xs bg-[#00CCFF] text-[#121212] px-2 py-1 rounded-full font-medium border border-[#0099CC]">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="mt-2 text-gray-300">{comment.text}</p>
                    
                    <div className="mt-3">
                      {replyingTo === comment.id ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-3 bg-[#1E1E1E] text-white border-2 border-[#444] rounded-md focus:ring-2 focus:ring-[#00CCFF] focus:border-[#00CCFF] cursor-text"
                            placeholder="Write your reply..."
                            rows={2}
                          />
                          <div className="flex gap-3 justify-end">
                            <motion.button 
                              whileHover={{ translateY: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setReplyingTo(null)}
                              className="px-4 py-2 bg-[#444] text-white font-medium rounded-md border-2 border-[#555] cursor-pointer"
                              disabled={replyStatus?.loading}
                            >
                              Cancel
                            </motion.button>
                            <motion.button 
                              whileHover={{ translateY: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => submitReply(comment.id)}
                              className={`px-4 py-2 ${replyStatus?.loading ? 'bg-[#0099CC]' : 'bg-[#00CCFF]'} text-[#121212] font-medium rounded-md flex items-center gap-2 border-2 border-[#0099CC] cursor-pointer`}
                              disabled={replyStatus?.loading}
                            >
                              {replyStatus?.loading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin"></div>
                                  Posting...
                                </>
                              ) : 'Post Reply'}
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <motion.button 
                          whileHover={{ translateY: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReplyClick(comment.id)}
                          className="bg-[#00CCFF] hover:bg-[#33DDFF] text-[#121212] font-medium py-1 px-3 rounded-md flex items-center gap-1 border-2 border-[#0099CC] cursor-pointer"
                        >
                          <FaReply /> Reply
                        </motion.button>
                      )}
                    </div>
                    
                    {comment.replies && comment.replies.data && comment.replies.data.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-[#444] space-y-3">
                        <p className="text-sm text-gray-400 font-medium">Replies:</p>
                        {comment.replies.data.map((reply) => (
                          <motion.div 
                            key={reply.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#2A2A2A] p-3 rounded-lg border border-[#444]"
                          >
                            <div className="flex justify-between">
                              <p className="font-bold text-white text-sm">{reply.username || "User"}</p>
                              <span className="text-xs bg-[#FFDE59] text-[#121212] px-2 py-0.5 rounded-full font-medium border border-[#CCAF47]">
                                {formatDate(reply.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-300 text-sm">{reply.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="bg-[#333] p-6 rounded-lg border-2 border-[#444] shadow-[4px_4px_0px_0px_rgba(68,68,68,0.3)] text-center">
                  <p className="text-white font-bold text-xl">No comments yet</p>
                  <p className="text-gray-400 mt-2">Be the first to reply!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
