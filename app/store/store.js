import { create } from 'zustand'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const useStore = create((set, get) => ({
  authStatus: null,
  instagramAccounts: [],
  authCode: null,
  mediaItems: [],
  userData: null,
  
  setAuthStatus: (status) => set({ authStatus: status }),
  
  saveUserDataToLocalStorage: () => {
    const userData = get().userData;
    if (userData) {
      localStorage.setItem('instagram_user_data', JSON.stringify(userData));
    }
  },
  
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
  
  exchangeCodeForToken: async (code) => {
    try {
      if (!code) {
        throw new Error('No authorization code provided');
      }
      
      const { authCode } = get();
      if (authCode === code) {
        return null;
      }
      
      set({ authCode: code });
      
      const response = await axios.get('/api/auth/callback', { 
        params: { code },
        timeout: 10000
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }
      
      set({ 
        userData: response.data,
        authStatus: { 
          success: true, 
          message: 'Successfully authenticated with Instagram!',
          token: response.data.access_token,
          user: response.data.user
        }
      });
      
      await get().fetchInstagramAccounts(response.data.access_token);
      
      get().saveUserDataToLocalStorage();
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code:', error);
      
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
      const response = await axios.get('/api/auth/instagram-accounts', {
        params: { access_token: accessToken }
      });
      
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        instagramAccounts: response.data.instagramAccounts
      };
      
      set({ 
        instagramAccounts: response.data.instagramAccounts,
        userData: updatedUserData
      });
      
      get().saveUserDataToLocalStorage();
      
      return response.data.instagramAccounts;
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error);
      throw error;
    }
  },
  
  getInstagramAuthUrl: () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    const scope = 'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_comments,instagram_content_publish'
    
    const state = Math.random().toString(36).substring(2, 15)
    
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`
  },
  
  extendAccessToken: async (shortLivedToken) => {
    try {
      const response = await axios.get('/api/auth/extend-token', {
        params: {
          access_token: shortLivedToken
        }
      });
      
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        longLivedToken: response.data
      };
      
      set({
        userData: updatedUserData
      });
      
      get().saveUserDataToLocalStorage();
      
      return response.data;
    } catch (error) {
      console.error('Error extending access token:', error);
      throw error;
    }
  },
  
  fetchInstagramMedia: async (igUserId, accessToken) => {
    try {
      const response = await axios.get(`/api/post/instagram-media`, {
        params: { 
          ig_user_id: igUserId,
          access_token: accessToken,
          fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count'
        }
      });
      
      const processedMedia = response.data.data?.map(item => ({
        ...item,
        like_count: item.like_count || 0,
        comments_count: item.comments_count || 0
      })) || [];
      
      const userData = get().userData || {};
      const updatedUserData = {
        ...userData,
        mediaItems: processedMedia
      };
      
      set({ 
        mediaItems: processedMedia,
        userData: updatedUserData
      });
      
      get().saveUserDataToLocalStorage();
      
      return {
        ...response.data,
        media: processedMedia
      };

    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  },
  
  fetchInstagramComments: async (mediaId, accessToken) => {
    try {
      const response = await axios.get(`/api/post/instagram-comments`, {
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
  
  replyToInstagramComment: async (commentId, message, accessToken) => {
    try {
      const response = await axios.post('/api/post/instagram-reply', {
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
