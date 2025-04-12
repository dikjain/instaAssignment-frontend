import { create } from 'zustand'
import axios from 'axios'

const useStore = create((set, get) => ({
  // Auth state
  authStatus: null,
  instagramAccounts: [],
  authCode: null, // Track the current auth code
  mediaItems: [], // Store fetched media items
  userData: null, // Store complete user data
  
  // Auth actions
  setAuthStatus: (status) => set({ authStatus: status }),
  
  // Save user data to localStorage
  saveUserDataToLocalStorage: () => {
    const userData = get().userData;
    if (userData) {
      localStorage.setItem('instagram_user_data', JSON.stringify(userData));
      console.log('User data saved to localStorage');
    }
  },
  
  // Load user data from localStorage on initialization
  loadUserDataFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem('instagram_user_data');
      if (savedData) {
        const userData = JSON.parse(savedData);
        set({ 
          userData,
          authStatus: userData.access_token ? { 
            success: true, 
            message: 'Restored session from localStorage',
            token: userData.access_token,
            user: userData.user
          } : null,
          instagramAccounts: userData.instagramAccounts || [],
          mediaItems: userData.mediaItems || []
        });
        return userData;
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    }
    return null;
  },
  
  // Instagram API calls
  exchangeCodeForToken: async (code) => {
    try {
      // Check if code is valid before making the request
      if (!code) {
        throw new Error('No authorization code provided');
      }
      
      // Check if we've already processed this code
      const { authCode } = get();
      if (authCode === code) {
        console.log('This code has already been processed');
        return null; // Return early without making another request
      }
      
      // Store the current code to prevent reuse
      set({ authCode: code });
      
      const response = await axios.get('http://localhost:5000/auth/callback', { 
        params: { code },
        // Add timeout to prevent hanging requests
        timeout: 10000
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }
      
      // Store complete user data
      set({ 
        userData: response.data,
        authStatus: { 
          success: true, 
          message: 'Successfully authenticated with Instagram!',
          token: response.data.access_token,
          user: response.data.user
        }
      });
      
      // Fetch Instagram accounts after successful authentication
      await get().fetchInstagramAccounts(response.data.access_token);
      
      // Save complete user data to localStorage after all fetching is done
      get().saveUserDataToLocalStorage();
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code:', error);
      
      // Handle specific error for expired code
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Authentication failed. Please try again.';
      
      const isExpiredCode = errorMessage.includes('expired') || 
                           errorMessage.includes('been used') ||
                           (error.response?.data?.error?.error_subcode === 36007) ||
                           (error.response?.data?.error?.error_subcode === 36009);
      
      set({ 
        authStatus: { 
          success: false, 
          message: isExpiredCode 
            ? 'Authorization code has expired or already been used. Please try logging in again.' 
            : `Authentication failed: ${errorMessage}`
        }
      });
      throw error;
    }
  },
  
  fetchInstagramAccounts: async (accessToken) => {
    try {
      const response = await axios.get('http://localhost:5000/auth/instagram-accounts', {
        params: { access_token: accessToken }
      });
      
      // Update user data with Instagram accounts
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        instagramAccounts: response.data.instagramAccounts
      };
      
      set({ 
        instagramAccounts: response.data.instagramAccounts,
        userData: updatedUserData
      });
      
      // Save updated user data to localStorage
      get().saveUserDataToLocalStorage();
      
      return response.data.instagramAccounts;
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error);
      throw error;
    }
  },
  
  // Instagram OAuth URL construction
  getInstagramAuthUrl: () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    const scope = 'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_comments,instagram_content_publish'
    
    // Add state parameter to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15)
    
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`
  },
  
  // Extend short-lived token to long-lived token
  extendAccessToken: async (shortLivedToken) => {
    try {
      const response = await axios.get('http://localhost:5000/auth/extend-token', {
        params: {
          access_token: shortLivedToken
        }
      });
      
      // Update user data with extended token
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        longLivedToken: response.data
      };
      
      set({
        userData: updatedUserData
      });
      
      // Save updated user data to localStorage
      get().saveUserDataToLocalStorage();
      
      return response.data;
    } catch (error) {
      console.error('Error extending access token:', error);
      throw error;
    }
  },
  
  // Fetch Instagram media posts
  fetchInstagramMedia: async (igUserId, accessToken) => {
    try {
      const response = await axios.get(`http://localhost:5000/post/instagram-media`, {
        params: { 
          ig_user_id: igUserId,
          access_token: accessToken,
          fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count'
        }
      });
      
      // Process media items to ensure they have all required fields
      const processedMedia = response.data.data?.map(item => ({
        ...item,
        like_count: item.like_count || 0,
        comments_count: item.comments_count || 0
      })) || [];
      
      // Store the media items in the state and update user data
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        mediaItems: processedMedia
      };
      
      set({ 
        mediaItems: processedMedia,
        userData: updatedUserData
      });
      
      // Save updated user data to localStorage
      get().saveUserDataToLocalStorage();
      
      console.log("Media items:", processedMedia);
      return {
        ...response.data,
        media: processedMedia
      };

    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  },
  
  // Fetch comments on an Instagram post
  fetchInstagramComments: async (mediaId, accessToken) => {
    try {
      const response = await axios.get(`http://localhost:5000/post/instagram-comments`, {
        params: { 
          media_id: mediaId,
          access_token: accessToken,
          fields: 'id,text,username,timestamp,replies,from'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram comments:', error);
      throw error;
    }
  },
  
  // Reply to a comment on an Instagram post
  replyToInstagramComment: async (commentId, message, accessToken) => {
    try {
      const response = await axios.post('http://localhost:5000/post/instagram-reply', {
        comment_id: commentId,
        message,
        access_token: accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Error posting Instagram reply:', error);
      throw error;
    }
  }
}))

export default useStore
