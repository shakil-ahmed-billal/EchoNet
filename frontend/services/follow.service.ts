import { apiClient } from './api-client';

export const followUser = async (userId: string) => {
  const { data } = await apiClient.post('/follow/follow', { followingId: userId });
  return data;
};

export const unfollowUser = async (userId: string) => {
  const { data } = await apiClient.post('/follow/unfollow', { followingId: userId });
  return data;
};
