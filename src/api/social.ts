const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const socialAPI = {
  getProfile: async (userId: string, token?: string) => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}/social/profile/${userId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  },

  followUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/social/follow/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to follow user');
    return await response.json();
  },

  unfollowUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/social/follow/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to unfollow user');
    return await response.json();
  },

  getPosts: async (category: string = 'all', limit: number = 20, offset: number = 0) => {
    const response = await fetch(`${API_URL}/social/posts?category=${category}&limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
  },

  createPost: async (token: string, post: { title: string; content: string; category: string }) => {
    const response = await fetch(`${API_URL}/social/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(post)
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  },

  toggleLike: async (token: string, postId: string) => {
    const response = await fetch(`${API_URL}/social/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to toggle like');
    return await response.json();
  }
};
