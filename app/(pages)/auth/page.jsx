'use client'

import React, { useEffect, useState } from 'react'
import { FaInstagram, FaCommentDots, FaChartLine, FaRocket, FaPlay, FaFilter } from 'react-icons/fa'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import useStore from '@/app/store/store'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const { 
    authStatus, 
    instagramAccounts, 
    exchangeCodeForToken, 
    getInstagramAuthUrl,
    setAuthStatus,
    fetchInstagramAccounts,
    extendAccessToken
  } = useStore()
  
  // Make a normal GET request to the backend on load to start the server
  useEffect(() => {
    const startServer = async () => {
      try {
        await fetch('/api', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log("Server ping successful");
      } catch (error) {
        console.error("Error pinging server:", error);
      }
    };
    
    startServer();
  }, []);
  
  useEffect(() => {
    // Check for error or success parameters in the URL
    const error = searchParams.get('error')
    const code = searchParams.get('code')

    console.log("Code from URL:", code)
    
    if (error) {
      console.log("Authentication error:", error)
      setAuthStatus({ 
        success: false, 
        message: `Authentication error: ${error}` 
      })
    } else if (code && !isProcessing && !redirectAttempted) {
      // Exchange the code for an access token
      const handleCodeExchange = async () => {
        try {
          setIsProcessing(true)
          console.log("Authorization code received:", code)
          const data = await exchangeCodeForToken(code)
          
          if (data && data.access_token) {
            // Try to extend the short-lived token to a long-lived one
            try {
              const extendedTokenData = await extendAccessToken(data.access_token)
              console.log("Token extended successfully:", extendedTokenData)
            } catch (extendError) {
              console.error("Error extending token:", extendError)
              // Continue with short-lived token if extension fails
            }
            
            // Wait for Instagram accounts to be fetched
            if (instagramAccounts.length > 0) {
              const firstAccount = instagramAccounts[0]
              console.log("Redirecting to details page with account:", firstAccount)
              setRedirectAttempted(true)
              router.push(`/details?ig_user_id=${firstAccount.instagramAccountId}&access_token=${data.access_token}`)
            } else {
              // If no accounts yet, wait a bit and check again
              console.log("Waiting for Instagram accounts to load...")
              setTimeout(() => {
                if (instagramAccounts.length > 0) {
                  const firstAccount = instagramAccounts[0]
                  console.log("Accounts loaded, redirecting to details page")
                  setRedirectAttempted(true)
                  router.push(`/details?ig_user_id=${firstAccount.instagramAccountId}&access_token=${data.access_token}`)
                } else {
                  console.error("No Instagram accounts found after waiting")
                  // Try to fetch accounts explicitly
                  fetchInstagramAccounts(data.access_token)
                    .then(accounts => {
                      if (accounts && accounts.length > 0) {
                        const firstAccount = accounts[0]
                        setRedirectAttempted(true)
                        router.push(`/details?ig_user_id=${firstAccount.instagramAccountId}&access_token=${data.access_token}`)
                      }
                    })
                    .catch(err => console.error("Error fetching accounts:", err))
                }
              }, 2000)
            }
          }
        } catch (error) {
          console.error('Error during authentication flow:', error)
          // Error handling is already done in exchangeCodeForToken
        } finally {
          setIsProcessing(false)
        }
      }
      
      handleCodeExchange()
    } else {
      console.log("No code or error in URL")
    }
  }, [searchParams, exchangeCodeForToken, instagramAccounts, router, isProcessing, redirectAttempted, setAuthStatus, fetchInstagramAccounts, extendAccessToken])

  // Add another effect to handle redirect when accounts are loaded after auth
  useEffect(() => {
    if (authStatus?.success && authStatus?.token && instagramAccounts.length > 0 && !isProcessing && !redirectAttempted) {
      const firstAccount = instagramAccounts[0]
      console.log("Auth status and accounts available, redirecting to details")
      setRedirectAttempted(true)
      router.push(`/details?ig_user_id=${firstAccount.instagramAccountId}&access_token=${authStatus.token}`)
    }
  }, [authStatus, instagramAccounts, router, isProcessing, redirectAttempted])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#121212] overflow-hidden"
    >
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Features */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontFamily: 'var(--font-rubik)' }}
              className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] tracking-wider bg-clip-text p-2 border-4 border-[#FF3366] rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] transform hover:rotate-[1deg] transition-transform"
            >
              Instagram Content Hub
            </motion.h1>
            
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl mb-10 text-gray-300"
            >
              Manage, analyze, and optimize your Instagram content in one place
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              <motion.div 
                whileHover={{ translateY: -8 }}
                className="bg-[#1E1E1E] p-6 rounded-xl border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <FaFilter className="text-4xl mb-4 text-[#00CCFF]" />
                <h3 className="text-xl font-bold mb-2 text-white">Content Filtering</h3>
                <p className="text-gray-400">Filter your Instagram content by type, engagement, and more</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ translateY: -8 }}
                className="bg-[#1E1E1E] p-6 rounded-xl border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <FaChartLine className="text-4xl mb-4 text-[#FFDE59]" />
                <h3 className="text-xl font-bold mb-2 text-white">Engagement Analytics</h3>
                <p className="text-gray-400">Track likes, comments, and other metrics to optimize your content</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ translateY: -8 }}
                className="bg-[#1E1E1E] p-6 rounded-xl border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <FaPlay className="text-4xl mb-4 text-[#FF3366]" />
                <h3 className="text-xl font-bold mb-2 text-white">Reels Management</h3>
                <p className="text-gray-400">Organize and analyze your Instagram Reels performance</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ translateY: -8 }}
                className="bg-[#1E1E1E] p-6 rounded-xl border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <FaCommentDots className="text-4xl mb-4 text-[#00CCFF]" />
                <h3 className="text-xl font-bold mb-2 text-white">Comment Management</h3>
                <p className="text-gray-400">Respond to comments and engage with your audience efficiently</p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-4 bg-[#1E1E1E] p-4 rounded-xl border-2 border-[#333]"
            >
              <div className="flex -space-x-4">
                {['#FF3366', '#00CCFF', '#FFDE59'].map((color, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + (i * 0.1) }}
                    className="w-10 h-10 rounded-full border-2 border-[#121212]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-gray-300">Join thousands of content creators who trust our platform</p>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Right side - Auth */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-[40%] bg-[#1E1E1E] p-8 flex items-center justify-center"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="flex flex-col items-center justify-center p-8 bg-[#1E1E1E] rounded-xl border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="bg-[#FF3366] p-4 rounded-full border-4 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <FaInstagram className="text-white text-4xl" />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-black text-white mb-6"
              >
                Instagram Content Hub
              </motion.h1>
            
              <AnimatePresence>
                {authStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-3 rounded-md w-full text-center ${
                      authStatus.success 
                        ? 'bg-[#00CCFF]/20 text-[#00CCFF] border-2 border-[#00CCFF]/50' 
                        : 'bg-[#FF3366]/20 text-[#FF3366] border-2 border-[#FF3366]/50'
                    }`}
                  >
                    {authStatus.message}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-[#FFDE59]/20 text-[#FFDE59] border-2 border-[#FFDE59]/50 rounded-md w-full text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-[#FFDE59] rounded-full border-t-transparent"></div>
                      <span>Processing your authentication... Please wait.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {authStatus?.user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-[#00CCFF]/20 text-white rounded-md w-full border-2 border-[#00CCFF]/50"
                  >
                    <p className="font-bold">Welcome, {authStatus.user.name}!</p>
                    <p className="text-xs text-gray-400">User ID: {authStatus.user.id}</p>
                    {authStatus.user.email && <p className="text-xs text-gray-400">Email: {authStatus.user.email}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {instagramAccounts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 w-full"
                  >
                    <h2 className="text-lg font-bold mb-2 text-white">Your Instagram Business Accounts:</h2>
                    <ul className="bg-[#121212] p-3 rounded-md border-2 border-[#333]">
                      {instagramAccounts.map((account, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + (index * 0.1) }}
                          className="mb-2 pb-2 border-b border-[#333] last:border-0"
                        >
                          <p className="font-medium text-white">{account.pageName}</p>
                          <p className="text-xs text-gray-400">Instagram ID: {account.instagramAccountId}</p>
                          {account.instagramDetails && (
                            <div className="mt-1">
                              <p className="text-sm text-[#00CCFF]">@{account.instagramDetails.username}</p>
                              {account.instagramDetails.followers_count && (
                                <p className="text-xs text-gray-500">
                                  Followers: {account.instagramDetails.followers_count.toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-8 text-center"
              >
                <p className="text-gray-300 mb-4">
                  Connect your Instagram Business account to manage content and insights
                </p>
                <p className="text-sm text-[#FF3366]">
                  Note: Requires an Instagram Business Account connected to a Facebook Page
                </p>
              </motion.div>
              
              <AnimatePresence>
                {!authStatus?.success && !isProcessing && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ delay: 0.8 }}
                    className="w-full"
                  >
                    <Link 
                      href={getInstagramAuthUrl()}
                      className="flex items-center justify-center gap-2 bg-[#FF3366] text-white font-bold py-3 px-6 rounded-lg border-4 border-[#CC2952] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-5px] transition-all w-full"
                      onClick={() => console.log("Login with Instagram clicked")}
                    >
                      <FaInstagram className="text-xl" />
                      Login with Instagram
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 text-sm text-gray-500"
              >
                <p>You'll be redirected to Instagram to authorize this application</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AuthPage