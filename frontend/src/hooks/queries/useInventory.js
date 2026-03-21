import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '../../services/inventory.service';

export const INVENTORY_KEYS = {
  all: ['inventory'],
  history: (productId) => [...INVENTORY_KEYS.all, 'history', productId],
};

export const useInventory = () => {
  return useQuery({
    queryKey: INVENTORY_KEYS.all,
    queryFn: inventoryService.getInventory,
  });
};

export const useStockHistory = (productId) => {
  return useQuery({
    queryKey: INVENTORY_KEYS.history(productId),
    queryFn: () => inventoryService.getStockHistory(productId),
    enabled: !!productId,
  });
};

export const useRestockInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity, costPrice, reason }) =>
      inventoryService.restockInventory(productId, quantity, costPrice, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.history(variables.productId) });
    },
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, changeQty, reason }) =>
      inventoryService.adjustInventory(productId, changeQty, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.history(variables.productId) });
    },
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
};
