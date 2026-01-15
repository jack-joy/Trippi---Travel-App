// Core types for our application
export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  trips: string[];
  bucketList: string[];
  visitedCountries: string[];
  badges: string[];
  createdAt: Date;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  photos: string[];
  isPublic: boolean;
  likes: number;
  comments: Comment[];
  collaborators: string[];
  itinerary: ItineraryDay[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'flight' | 'accommodation' | 'sightseeing' | 'food' | 'transport' | 'other';
  title: string;
  description?: string;
  location?: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  startTime: Date;
  endTime: Date;
  cost?: number;
  bookingReference?: string;
  notes?: string;
  photos: string[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: Date;
}

export interface BucketListItem {
  id: string;
  userId: string;
  destination: string;
  country: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  targetDate?: Date;
  savedBy: string[];
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'trip_update' | 'collaboration';
  fromUserId: string;
  fromUsername: string;
  fromUserAvatar?: string;
  tripId?: string;
  tripTitle?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}
