import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Initialize Supabase client
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      },
    },
  }
);

// Types for our database tables
export type Tables = {
  bucket_list: {
    Row: {
      id: string;
      user_id: string;
      name: string;
      location: string;
      notes: string | null;
      priority: 'high' | 'medium' | 'low';
      is_completed: boolean;
      image: string;
      created_at: string;
      activities?: string[];
      hotels?: string[];
      restaurants?: string[];
      flights?: string;
      best_time?: string;
      estimated_budget?: string;
      duration?: string;
    };
    Insert: Omit<BucketListItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
    Update: Partial<Omit<BucketListItem, 'id' | 'created_at'>>;
  };
};

export type BucketListItem = Tables['bucket_list']['Row'];

// Helper function to handle Supabase errors
const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  throw error;
};

// Bucket List API
export const bucketListApi = {
  // Fetch all bucket list items for the current user
  async getBucketList(userId: string): Promise<BucketListItem[]> {
    try {
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error, 'getBucketList');
    }
  },

  // Add a new bucket list item
  async addItem(item: Omit<BucketListItem, 'id' | 'created_at' | 'user_id'>): Promise<BucketListItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bucket_list')
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error, 'addItem');
    }
  },

  // Update a bucket list item
  async updateItem(id: string, updates: Partial<Omit<BucketListItem, 'id' | 'created_at' | 'user_id'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('bucket_list')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateItem');
    }
  },

  // Delete a bucket list item
  async deleteItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleteItem');
    }
  },

  // Toggle completion status of a bucket list item
  async toggleCompletion(id: string, currentStatus: boolean): Promise<void> {
    return this.updateItem(id, { is_completed: !currentStatus });
  },
};
