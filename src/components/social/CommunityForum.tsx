import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { socialAPI } from '@/api/social';
import { FaHeart, FaRegHeart, FaComments, FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  display_name: string;
  photo_url: string;
  likes: number;
  comment_count: number;
  created_at: string;
  is_liked?: boolean;
}

const CommunityForum: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useDynamicTranslations();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await socialAPI.getPosts(category);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await socialAPI.createPost(token, newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: 'general' });
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(t('alerts.postCreateError'));
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const result = await socialAPI.toggleLike(token, postId);
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + (result.liked ? 1 : -1),
            is_liked: result.liked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaComments /> {t('forum.title')}
          </h1>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-2"
            >
              <FaPen /> {t('forum.newPost')}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'general', 'tips', 'questions', 'showcase'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
                category === cat
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {t(`forum.categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-8">{t('forum.loading')}</div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}
              >
                <div className="flex items-start gap-4">
                  <Link to={`/profile/${post.user_id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                      {post.photo_url && <img src={post.photo_url} alt={post.display_name} className="w-full h-full object-cover" />}
                    </div>
                  </Link>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                        <div className="text-sm opacity-75 mb-2">
                          {t('forum.postBy')} <Link to={`/profile/${post.user_id}`} className="hover:underline">{post.display_name}</Link> • {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                    
                    <p className="mb-4 opacity-90 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center gap-6 text-sm opacity-75">
                      <button
                        onClick={() => handleLike(post.id)}
                        title={post.is_liked ? 'Quitar me gusta' : 'Me gusta'}
                        className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                          post.is_liked ? 'text-red-500' : ''
                        }`}
                      >
                        {post.is_liked ? <FaHeart /> : <FaRegHeart />}
                        <span>{post.likes}</span>
                      </button>
                      
                      <div className="flex items-center gap-2" title={t('forum.comments')}>
                        <FaComments />
                        <span>{post.comment_count} {t('forum.comments')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-4">{t('forum.createModal.title')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">{t('forum.createModal.titleLabel')}</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className={`w-full p-2 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    placeholder={t('forum.createModal.titlePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">{t('forum.createModal.categoryLabel')}</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className={`w-full p-2 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    {['general', 'tips', 'questions', 'showcase'].map(cat => (
                      <option key={cat} value={cat}>{t(`forum.categories.${cat}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">{t('forum.createModal.contentLabel')}</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={5}
                    className={`w-full p-2 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    placeholder={t('forum.createModal.contentPlaceholder')}
                  />
                </div>

                <div className="flex gap-2 justify-end mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.title || !newPost.content}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {t('forum.createModal.publish')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
