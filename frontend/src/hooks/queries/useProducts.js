import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../services/product.service';

const PRODUCT_KEYS = {
  all: ['products'],
  details: () => [...PRODUCT_KEYS.all, 'detail'],
  detail: (id) => [...PRODUCT_KEYS.details(), id],
};

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCT_KEYS.all,
    queryFn: productService.getProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productData }) => productService.updateProduct(id, productData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};
