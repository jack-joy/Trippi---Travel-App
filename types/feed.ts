export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  location: string;
  images: string[];
  caption: string;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
  tripId: string;
  tripName: string;
  destination: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
}
