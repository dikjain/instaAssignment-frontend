'use client'

import React from 'react'
import Image from 'next/image'
import { FaComment, FaHeart, FaPlay } from 'react-icons/fa'
import { motion } from 'framer-motion'

export const MediaCard = ({ item, onClick }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      whileHover={{ 
        translateY: -8,
        transition: { duration: 0.2 }
      }}
      className={`bg-[#1E1E1E] rounded-${item.media_type === 'VIDEO' ? '[100px]' : 'lg'} border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer mb-6 ${
        item.media_type === 'VIDEO' ? 'aspect-[9/16]' : 'aspect-square'
      }`}
      onClick={() => onClick(item)}
    >
      <div className="relative w-full h-full overflow-hidden">
        {item.media_type === 'VIDEO' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-black/5 to-black/20">
            <div className='relative w-full h-full overflow-hidden'>
              <Image 
                src={item.thumbnail_url || '/video-placeholder.jpg'} 
                alt={item.caption || 'Instagram video'} 
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                style={{ objectPosition: 'center' }}
              />
            </div>
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-[#FF3366] rounded-full p-4 border-2 border-[#CC2952]">
                <FaPlay className="text-white text-2xl" />
              </div>
            </motion.div>
            <div className="absolute top-2 right-2 bg-[#00CCFF] text-[#121212] text-sm px-3 py-1 rounded-full font-bold border-2 border-[#0099CC]">
              Reel
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-between">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-[#FF3366] px-2 py-1 rounded-full border-2 border-[#CC2952]"
              >
                <FaHeart className="text-white" />
                <span className="text-sm font-bold text-white">{item.like_count || 0}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-[#00CCFF] px-2 py-1 rounded-full border-2 border-[#0099CC]"
              >
                <FaComment className="text-white" />
                <span className="text-sm font-bold text-white">{item.comments_count || 0}</span>
              </motion.div>
            </div>
            {item.caption && (
              <div className="absolute bottom-12 left-0 right-0 bg-black/70 p-2">
                <p className="text-white text-sm line-clamp-2">{item.caption}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image 
              src={item.media_url} 
              alt={item.caption || 'Instagram post'} 
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute top-2 right-2 bg-[#FFDE59] text-[#121212] text-sm px-3 py-1 rounded-full font-bold border-2 border-[#CCAF47]">
              {item.media_type === 'CAROUSEL_ALBUM' ? 'Album' : 'Image'}
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-between">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-[#FF3366] px-2 py-1 rounded-full border-2 border-[#CC2952]"
              >
                <FaHeart className="text-white" />
                <span className="text-sm font-bold text-white">{item.like_count || 0}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 bg-[#00CCFF] px-2 py-1 rounded-full border-2 border-[#0099CC]"
              >
                <FaComment className="text-white" />
                <span className="text-sm font-bold text-white">{item.comments_count || 0}</span>
              </motion.div>
            </div>
            {item.caption && (
              <div className="absolute bottom-12 left-0 right-0 bg-black/70 p-2">
                <p className="text-white text-sm line-clamp-2">{item.caption}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const NoMediaCard = ({ searchTerm, activeFilter, onClearFilters }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="col-span-full text-center py-12 bg-[#1E1E1E] rounded-xl border-2 border-[#333] shadow-[8px_8px_0px_0px_rgba(51,51,51,0.3)]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 1.1, 1] }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-[#FFDE59] border-2 border-[#CCAF47]"
      >
        <FaComment className="text-[#121212] text-3xl" />
      </motion.div>
      <h2 className="text-2xl font-black text-white mb-2">No Instagram Posts Found</h2>
      <p className="text-gray-300 max-w-md mx-auto font-medium">
        {searchTerm || activeFilter !== 'all' 
          ? "No posts match your current filters. Try adjusting your search criteria."
          : "This account doesn't have any posts or we couldn't retrieve them."}
      </p>
      {(searchTerm || activeFilter !== 'all') && (
        <motion.button
          whileHover={{ translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearFilters}
          className="mt-6 px-6 py-3 bg-[#FF3366] text-white font-bold rounded-lg border-2 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(204,41,82,0.3)]"
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  )
}
