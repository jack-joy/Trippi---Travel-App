import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '@/types/feed';
import { useAuth } from '@/contexts/AuthContext';
import { followUser, unfollowUser, isFollowing, likePost, unlikePost } from '@/services/social';
import { formatDistanceToNow } from 'date-fns';
import Comments from './Comments';

const { width } = Dimensions.get('window');
const POST_IMAGE_HEIGHT = width * 1.1;

interface PostCardProps {
  post: Post;
  onLike: (postId: Post['id']) => void;
  onSave: (postId: Post['id']) => void;
  onComment: (postId: Post['id']) => void;
  onShare: (postId: Post['id']) => void;
  onMore: (postId: Post['id']) => void;
  onImagePress: (postId: Post['id']) => void;
  currentImageIndex: {[key: string]: number};
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  likeAnim: Animated.Value;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onSave,
  onComment,
  onShare,
  onMore,
  onImagePress,
  currentImageIndex,
  likedPosts,
  savedPosts,
  likeAnim
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [showAllText, setShowAllText] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isLiked = likedPosts.has(post.id);
  const isSaved = savedPosts.has(post.id);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);

  useEffect(() => {
    // Reset image index when post changes
    setImageIndex(currentImageIndex[post.id] || 0);
    
    // Check if current user is following the post author
    const checkFollowingStatus = async () => {
      if (currentUser && post.userId !== currentUser.id) {
        try {
          const following = await isFollowing(currentUser.id, post.userId);
          setIsFollowingUser(following);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };
    
    checkFollowingStatus();
  }, [post.id, currentImageIndex, currentUser, post.userId]);

  const handleImagePress = () => {
    onImagePress(post.id);
  };

  const handleLikePress = async () => {
    if (!currentUser) {
      router.push('/(auth)/sign-in');
      return;
    }
    
    try {
      setIsProcessing(true);
      const wasLiked = isLiked;
      
      // Optimistic update
      const newLikesCount = wasLiked ? localLikesCount - 1 : localLikesCount + 1;
      setLocalLikesCount(newLikesCount);
      
      // Call the API
      if (wasLiked) {
        await unlikePost(post.id, currentUser.id);
      } else {
        await likePost(post.id, currentUser.id);
        // Trigger like animation
        Animated.sequence([
          Animated.spring(likeAnim, {
            toValue: 1.2,
            friction: 2,
            useNativeDriver: true,
          }),
          Animated.spring(likeAnim, {
            toValue: 1,
            friction: 2,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      // Update parent component
      onLike(post.id);
    } catch (error) {
      // Revert on error
      setLocalLikesCount(localLikesCount);
      Alert.alert('Error', 'Failed to update like. Please try again.');
      console.error('Like error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePress = async () => {
    if (!currentUser) {
      router.push('/(auth)/sign-in');
      return;
    }
    
    try {
      setIsProcessing(true);
      // Save/unsave the post - will need to connect to backend later
      onSave(post.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to save post. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const [showComments, setShowComments] = useState(false);

  const handleCommentPress = () => {
    if (!currentUser) {
      router.push('/(auth)/sign-in');
      return;
    }
    setShowComments(true);
  };

  const closeComments = () => {
    setShowComments(false);
    // Update parent component with new comment count
    onComment(post.id);
  };

  const handleSharePress = async () => {
    try {
      // Share functionality - could use Expo Sharing API here
      onShare(post.id);
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  
  const handleFollowPress = async () => {
    if (!currentUser) {
      router.push('/(auth)/sign-in');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      if (isFollowingUser) {
        await unfollowUser(currentUser.id, post.userId);
      } else {
        await followUser(currentUser.id, post.userId);
      }
      
      setIsFollowingUser(!isFollowingUser);
    } catch (error) {
      Alert.alert('Error', `Failed to ${isFollowingUser ? 'unfollow' : 'follow'} user. Please try again.`);
      console.error('Follow error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMorePress = () => {
    onMore(post.id);
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handleImagePress}
      style={styles.imageContainer}
    >
      <Image 
        source={{ uri: item }} 
        style={styles.postImage} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (post.images.length <= 1) return null;
    
    return (
      <View style={styles.pagination}>
        {post.images.map((_: string, index: number) => (
          <View 
            key={index} 
            style={[
              styles.paginationDot, 
              index === imageIndex && styles.paginationDotActive
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={() => router.push(`/profile/${post.userId}`)}>
            <Image 
              source={{ uri: post.userAvatar }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
          <View style={styles.userTextContainer}>
            <View style={styles.usernameRow}>
              <TouchableOpacity onPress={() => router.push(`/profile/${post.userId}`)}>
                <Text style={styles.username}>{post.username}</Text>
              </TouchableOpacity>
              {currentUser && post.userId !== currentUser.id && (
                <TouchableOpacity 
                  style={[
                    styles.followButton, 
                    isFollowingUser && styles.followingButton
                  ]}
                  onPress={handleFollowPress}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.followButtonText}>
                      {isFollowingUser ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={12} color="#666" /> {post.location}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMorePress} disabled={isProcessing}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Images */}
      <View style={styles.imageCarousel}>
        <FlatList
          data={post.images}
          renderItem={renderImage}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setImageIndex(newIndex);
          }}
        />
        {renderPagination()}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            onPress={handleLikePress} 
            style={styles.actionButton}
            disabled={isProcessing}
          >
            <Animated.View style={{
              transform: [{ scale: likeAnim }]
            }}>
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={28} 
                color={isLiked ? '#FF3B30' : '#333'} 
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleCommentPress} 
            style={styles.actionButton}
            disabled={isProcessing}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSharePress} 
            style={styles.actionButton}
            disabled={isProcessing}
          >
            <Ionicons 
              name="paper-plane-outline" 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleSavePress}
          disabled={isProcessing}
        >
          <Ionicons 
            name={isSaved ? 'bookmark' : 'bookmark-outline'} 
            size={24} 
            color={isSaved ? '#000' : '#333'} 
          />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <TouchableOpacity 
        onPress={() => {
          // Could show a modal here with everyone who liked the post
        }}
        disabled={isProcessing}
      >
        <Text style={styles.likes}>
          {localLikesCount.toLocaleString()} {localLikesCount === 1 ? 'like' : 'likes'}
        </Text>
      </TouchableOpacity>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text 
          style={styles.caption} 
          numberOfLines={showAllText ? undefined : 2}
          onPress={() => setShowAllText(!showAllText)}
        >
          <Text style={styles.captionUsername}>{post.username} </Text>
          {post.caption}
        </Text>
        {!showAllText && post.caption.length > 100 && (
          <Text style={styles.seeMore} onPress={() => setShowAllText(true)}>
            more
          </Text>
        )}
      </View>

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag: string, index: number) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Comments */}
      {post.commentsCount > 0 && (
        <TouchableOpacity 
          onPress={handleCommentPress}
          disabled={isProcessing}
        >
          <Text style={styles.commentsText}>
            View all {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{post.timeAgo}</Text>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={closeComments}
      >
        <View style={{ flex: 1 }}>
          <Comments 
            postId={post.id} 
            onClose={closeComments} 
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  followButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 10,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#262626',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  imageCarousel: {
    position: 'relative',
    height: POST_IMAGE_HEIGHT,
    backgroundColor: '#f8f8f8',
  },
  imageContainer: {
    width,
    height: '100%',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
    padding: 5,
  },
  likes: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 15,
    marginBottom: 5,
    color: '#262626',
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  captionUsername: {
    fontWeight: '600',
    color: '#333',
  },
  caption: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  seeMore: {
    color: '#999',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: '#0fa3a3',
    fontSize: 12,
  },
  commentsText: {
    color: '#999',
    fontSize: 13,
    marginLeft: 10,
    marginBottom: 5,
  },
  timestamp: {
    color: '#999',
    fontSize: 10,
    textTransform: 'uppercase',
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default PostCard;
