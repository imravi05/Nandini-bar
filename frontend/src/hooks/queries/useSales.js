import { useMutation, useQueryClient } from "@tanstack/react-query";
// import salesService from '../../services/sales.service';
import { parcelService, salesService } from "../../services/sales.service";

const SALE_KEYS = {
  all: ["sales"],
  lists: () => [...SALE_KEYS.all, "list"],
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => {
      // Invalidate relevant queries like daily sales, inventory, and recent sales
      queryClient.invalidateQueries({ queryKey: ["daily-sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
export const useCreateParcelSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: parcelService.createParcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesService.deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
