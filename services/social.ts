import { supabase } from '@/lib/supabase';

// Follow a user
export const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself');
  }

  const { data, error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, following_id: followingId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You are already following this user');
    }
    throw error;
  }

  // Create a notification
  await supabase
    .from('notifications')
    .insert([{
      user_id: followingId,
      from_user_id: followerId,
      type: 'follow'
    }]);

  return data;
};

// Unfollow a user
export const unfollowUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw error;
  return true;
};

// Check if current user is following another user
export const isFollowing = async (followerId: string, followingId: string) => {
  if (followerId === followingId) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }

  return !!data;
};

// Like a post
export const likePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_likes')
    .insert([{ post_id: postId, user_id: userId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already liked this post');
    }
    throw error;
  }

  // Create a notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post && post.user_id !== userId) {
    await supabase
      .from('notifications')
      .insert([{
        user_id: post.user_id,
        from_user_id: userId,
        type: 'like',
        post_id: postId
      }]);
  }

  return data;
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// Add a comment
export const addComment = async (postId: string, userId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, user_id: userId, content }])
    .select(`
      *,
      user:user_id (id, username, avatar_url)
    `)
    .single();

  if (error) throw error;

  // Create a notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post && post.user_id !== userId) {
    await supabase
      .from('notifications')
      .insert([{
        user_id: post.user_id,
        from_user_id: userId,
        type: 'comment',
        post_id: postId,
        comment_id: data.id
      }]);
  }

  return data;
};

// Get post likes
export const getPostLikes = async (postId: string) => {
  const { data, error } = await supabase
    .from('post_likes')
    .select(`
      id,
      user:user_id (id, username, avatar_url),
      created_at
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get post comments
export const getPostComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user:user_id (id, username, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get user notifications
export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      is_read,
      created_at,
      post_id,
      comment_id,
      from_user:from_user_id (id, username, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

// Mark notifications as read
export const markNotificationsAsRead = async (notificationIds: string[]) => {
  if (notificationIds.length === 0) return;
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds);

  if (error) throw error;
  return true;
};

// Get user's followers
export const getUserFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      follower:profiles!follower_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get users that a user is following
export const getUserFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      following:profiles!following_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
