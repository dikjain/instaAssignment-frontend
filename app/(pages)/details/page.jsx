'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useStore from '@/app/store/store'
import Image from 'next/image'
import { FaFilter, FaSearch, FaUser, FaHeart, FaUserFriends, FaPhotoVideo } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Masonry from 'react-masonry-css'
import { MediaCard, NoMediaCard } from '@/app/components/cards'

export default function DetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchInstagramMedia, loadUserDataFromLocalStorage } = useStore()
  
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [userData, setUserData] = useState(null)
  
  useEffect(() => {
    // Load user data from localStorage first
    const localUserData = loadUserDataFromLocalStorage()
    if (localUserData) {
      setUserData(localUserData)
      setMediaItems(localUserData.mediaItems || [])
    }
    
    const igUserId = searchParams.get('ig_user_id')
    const accessToken = searchParams.get('access_token')
    
    if (igUserId && accessToken) {
      loadInstagramMedia(igUserId, accessToken)
    } else {
      setError('Missing Instagram user ID or access token')
      setLoading(false)
    }
  }, [searchParams])
  
  const loadInstagramMedia = async (igUserId, accessToken) => {
    try {
      setLoading(true)
      const data = await fetchInstagramMedia(igUserId, accessToken)
      console.log("Media data loaded:", data.media)
      setMediaItems(data.media || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to load Instagram media')
      setLoading(false)
      console.error(err)
    }
  }
  
  const handlePostClick = (post) => {
    // Store post data in localStorage to access it from the post page
    localStorage.setItem(`post_${post.id}`, JSON.stringify(post))
    
    // Navigate to the post detail page
    const accessToken = searchParams.get('access_token')
    const igUserId = searchParams.get('ig_user_id')
    router.push(`/post/${post.id}?access_token=${accessToken}&ig_user_id=${igUserId}`)
  }
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }
  
  const filteredItems = mediaItems
    .filter(item => {
      if (activeFilter === 'all') return true
      return item.media_type.toLowerCase() === activeFilter.toLowerCase()
    })
    .filter(item => 
      item.caption ? item.caption.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
  
  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  }
  
  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212]">
        {userData && userData.user && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-[#1E1E1E] p-4 rounded-xl border-2 border-[#333] shadow-[6px_6px_0px_0px_rgba(51,51,51,0.3)] flex items-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#333] overflow-hidden mr-4 border-2 border-[#FF3366]">
              {userData.instagramAccounts[0].instagramDetails.profile_picture_url ? (
                <Image 
                  src={userData.instagramAccounts[0].instagramDetails.profile_picture_url} 
                  alt={userData.instagramAccounts[0].instagramDetails.username || 'User'} 
                  width={64} 
                  height={64} 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FF3366]">
                  <FaUser className="text-white text-2xl" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{userData.instagramAccounts[0].instagramDetails.username || 'Instagram User'}</h2>
              <p className="text-gray-400">Loading your content...</p>
            </div>
          </motion.div>
        )}
        
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
        
        {/* Loading skeleton */}
        <div className="w-full max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 8].map((item) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: item * 0.1 }}
                className="bg-[#1E1E1E] rounded-lg border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden aspect-square"
              >
                <div className="w-full h-full bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] animate-pulse"></div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                  <div className="w-16 h-8 bg-[#333] rounded-full animate-pulse"></div>
                  <div className="w-16 h-8 bg-[#333] rounded-full animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
          className="bg-[#1E1E1E] p-8 rounded-xl shadow-2xl max-w-md border-2 border-[#333]"
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium"
            onClick={() => router.push('/')}
          >
            Return Home
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#121212] p-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        {userData && userData.user && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-[#1E1E1E] p-6 rounded-xl border-2 border-[#333] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-24 h-24 rounded-full bg-[#333] overflow-hidden mr-6 border-2 border-[#FF3366] flex-shrink-0">
                {userData.instagramAccounts[0].instagramDetails.profile_picture_url ? (
                  <Image 
                    src={userData.instagramAccounts[0].instagramDetails.profile_picture_url} 
                    alt={userData.instagramAccounts[0].instagramDetails.username || 'User'} 
                    width={96} 
                    height={96} 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FF3366]">
                    <FaUser className="text-white text-3xl" />
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex-grow">
                <h2 className="text-white font-bold text-2xl">{userData.instagramAccounts[0].instagramDetails.username || 'Instagram User'}</h2>
                <p className="text-gray-300 mt-1">{userData.instagramAccounts[0].instagramDetails.biography || 'Instagram Content Creator'}</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center bg-[#2A2A2A] px-4 py-2 rounded-lg border border-[#444]">
                    <FaHeart className="text-[#FF3366] mr-2" />
                    <div>
                      <p className="text-white font-bold">{userData.instagramAccounts[0].instagramDetails.followers_count || 0}</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-[#2A2A2A] px-4 py-2 rounded-lg border border-[#444]">
                    <FaUserFriends className="text-[#00CCFF] mr-2" />
                    <div>
                      <p className="text-white font-bold">{userData.instagramAccounts[0].instagramDetails.follows_count || 0}</p>
                      <p className="text-xs text-gray-400">Following</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-[#2A2A2A] px-4 py-2 rounded-lg border border-[#444]">
                    <FaPhotoVideo className="text-[#FFDE59] mr-2" />
                    <div>
                      <p className="text-white font-bold">{userData.instagramAccounts[0].instagramDetails.media_count || 0}</p>
                      <p className="text-xs text-gray-400">Posts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--font-rubik)' }}
            className="text-3xl font-black text-white mb-4 md:mb-0 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] tracking-wider bg-clip-text p-2 border-4 border-[#FF3366] rounded-lg shadow-[6px_6px_0px_0px_rgba(255,51,102,0.3)] rotate-[-1deg] transform hover:rotate-[1deg] transition-transform"
          >
            Instagram Content Hub
          </motion.h1>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex space-x-3"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search captions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border-2 border-[#333] bg-[#1E1E1E] text-white focus:ring-2 focus:ring-[#FF3366] focus:border-[#FF3366] outline-none shadow-[4px_4px_0px_0px_rgba(255,51,102,0.3)]"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <motion.button
              whileHover={{ translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#00CCFF] p-3 rounded-lg border-2 border-[#0099CC] shadow-[4px_4px_0px_0px_rgba(0,153,204,0.3)]"
            >
              <FaFilter className="text-[#121212] text-xl" />
            </motion.button>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-[#1E1E1E] p-5 rounded-xl border-2 border-[#333] shadow-[6px_6px_0px_0px_rgba(51,51,51,0.3)]">
                <h3 className="font-black mb-3 text-[#FFDE59] text-xl">Filter by type:</h3>
                <div className="flex flex-wrap gap-3">
                  {['all', 'image', 'video', 'carousel_album'].map(filter => (
                    <motion.button
                      key={filter}
                      whileHover={{ translateY: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-5 py-3 rounded-lg capitalize font-bold border-2 ${
                        activeFilter === filter 
                          ? 'bg-[#FF3366] text-white border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(204,41,82,0.3)]' 
                          : 'bg-[#2A2A2A] text-white border-[#333] shadow-[4px_4px_0px_0px_rgba(51,51,51,0.3)] hover:bg-[#333]'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto -ml-6"
                columnClassName="pl-6 bg-clip-padding mb-6"
              >
                {filteredItems.map((item, index) => (
                  <MediaCard 
                    key={item.id}
                    item={item}
                    onClick={handlePostClick}
                  />
                ))}
              </Masonry>
            </motion.div>
          ) : (
            <NoMediaCard 
              searchTerm={searchTerm}
              activeFilter={activeFilter}
              onClearFilters={clearFilters}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
