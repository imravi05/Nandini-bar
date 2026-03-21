import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused
      retry: 1, // Only retry failed requests once to avoid infinite loops
      staleTime: 0, // Data always considered stale - forces refetch on every mount
      cacheTime: 10 * 60 * 1000, // Unused data remains in cache for 10 minutes
    },
    mutations: {
      retry: false, // Never retry mutations automatically (can lead to duplicate creations)
    },
  },
});
