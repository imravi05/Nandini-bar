import { useMutation, useQueryClient } from '@tanstack/react-query';
import parcelService from '../../services/parcel.service';

export const useCreateParcelSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: parcelService.createParcelSale,
    onSuccess: () => {
      // Invalidate inventory and sales to refresh UI after a parcel sale
      queryClient.invalidateQueries({ queryKey: ['daily-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
