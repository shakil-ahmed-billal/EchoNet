import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as PropertyService from '@/services/property.service';
import { toast } from 'sonner';

export const useProperties = (params: any) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => PropertyService.getProperties(params),
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => PropertyService.getPropertyById(id),
    enabled: !!id,
  });
};

export const useMyProperties = () => {
  return useQuery({
    queryKey: ['my-properties'],
    queryFn: PropertyService.getMyProperties,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: PropertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Property listed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to list property');
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: PropertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Property deleted successfully');
    },
  });
};

// Bookings
export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: PropertyService.getMyBookings,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: PropertyService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Visit scheduled successfully');
    },
  });
};

// Enquiries
export const useMyEnquiries = () => {
  return useQuery({
    queryKey: ['my-enquiries'],
    queryFn: PropertyService.getMyEnquiries,
  });
};

export const useSendEnquiry = () => {
  return useMutation({
    mutationFn: PropertyService.sendEnquiry,
    onSuccess: () => {
      toast.success('Enquiry sent successfully');
    },
  });
};

// Admin
export const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PropertyService.approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property approved');
    },
  });
};

export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PropertyService.rejectProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property rejected');
    },
  });
};

// Agents
export const useAgents = (params: any) => {
  return useQuery({
    queryKey: ['agents', params],
    queryFn: () => PropertyService.getAgents(params),
  });
};

export const useVerifyAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PropertyService.verifyAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent verified successfully');
    },
  });
};
