import { apiClient } from './api-client';

export interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  image?: string;
  meta?: any;
  isFollowing?: boolean;
  isFriend?: boolean;
}

export type FetchUsersResponse = {
  success: boolean;
  message: string;
  data: {
    data: UserSuggestion[]; // usually pagination wraps in data.data or data.result 
    meta?: any;
  } | UserSuggestion[];
}

export const getUsers = async (params: { page?: number; limit?: number; searchTerm?: string } = {}): Promise<UserSuggestion[]> => {
  const { data } = await apiClient.get<FetchUsersResponse>('/users', { params });
  
  if (Array.isArray(data.data)) {
    return data.data;
  }
  
  if (data.data && Array.isArray((data.data as any).data)) {
    return (data.data as any).data;
  }

  if (data.data && Array.isArray((data.data as any).result)) {
    return (data.data as any).result;
  }

  return [];
};

export const updateUserProfile = async (
  id: string, 
  profileData: { 
    name?: string; 
    bio?: string; 
    avatarUrl?: string;
    coverPhotoUrl?: string;
    website?: string;
    workplace?: string;
    education?: string;
    isPrivate?: boolean;
  }
) => {
  const { data } = await apiClient.patch(`/users/${id}`, profileData);
  return data;
};
