import { apiClient } from "./api-client";

export const getProperties = async (params: any) => {
  const { data } = await apiClient.get('/properties', { params });
  return data.data;
};

export const getPropertyById = async (id: string) => {
  const { data } = await apiClient.get(`/properties/${id}`);
  return data.data;
};

export const createProperty = async (payload: any) => {
  const { data } = await apiClient.post('/properties', payload);
  return data.data;
};

export const getMyProperties = async (params: any) => {
  const { data } = await apiClient.get('/properties/my-properties', { params });
  return data.data;
};

export const updateProperty = async (id: string, payload: any) => {
  const { data } = await apiClient.put(`/properties/${id}`, payload);
  return data.data;
};

export const deleteProperty = async (id: string) => {
  const { data } = await apiClient.delete(`/properties/${id}`);
  return data.data;
};

export const approveProperty = async (id: string) => {
  const { data } = await apiClient.put(`/properties/${id}/approve`);
  return data.data;
};

export const rejectProperty = async (id: string) => {
  const { data } = await apiClient.put(`/properties/${id}/reject`);
  return data.data;
};

// Bookings
export const createBooking = async (payload: any) => {
  const { data } = await apiClient.post('/bookings', payload);
  return data.data;
};

export const getMyBookings = async () => {
  const { data } = await apiClient.get('/bookings/my-bookings');
  return data.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const { data } = await apiClient.put(`/bookings/${id}/status`, { status });
  return data.data;
};

// Enquiries
export const sendEnquiry = async (payload: any) => {
  const { data } = await apiClient.post('/enquiries', payload);
  return data.data;
};

export const getMyEnquiries = async () => {
  const { data } = await apiClient.get('/enquiries/my-enquiries');
  return data.data;
};

// Agents
export const getAgents = async (params?: any) => {
  const { data } = await apiClient.get('/agents', { params });
  return data.data;
};

export const getAgentProfile = async () => {
  const { data } = await apiClient.get('/agents/profile');
  return data.data;
};

export const verifyAgent = async (id: string) => {
  const { data } = await apiClient.put(`/agents/${id}/verify`);
  return data.data;
};
