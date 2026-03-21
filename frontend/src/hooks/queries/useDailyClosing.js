import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dailyClosingService from '../../services/dailyClosing.service';

const DAILY_KEYS = {
  all: ['daily'],
  report: (date) => [...DAILY_KEYS.all, 'report', date],
  sales: (date) => [...DAILY_KEYS.all, 'sales', date],
};

export const useDailyReport = (date) => {
  return useQuery({
    queryKey: DAILY_KEYS.report(date),
    queryFn: () => dailyClosingService.getReport(date),
    enabled: !!date,
  });
};

export const useDailySales = (date) => {
  return useQuery({
    queryKey: DAILY_KEYS.sales(date),
    queryFn: () => dailyClosingService.getTodaySales(date),
    enabled: !!date,
  });
};

export const useCloseDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dailyClosingService.closeDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_KEYS.all });
    },
  });
};

export const useReopenDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dailyClosingService.reopenDay,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: DAILY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DAILY_KEYS.report(variables) });
    },
  });
};

/** 
 * COMPOSITE HOOK: Handles the logic originally in DailyClosingPage.jsx
 * It fetches the official report, and if OPEN/REOPENED, it also fetches live sales to build a preview.
 */
export const useCompositeDailyReport = (date) => {
  return useQuery({
    queryKey: [...DAILY_KEYS.all, 'composite', date],
    queryFn: async () => {
      let report = null;
      let status = 'OPEN';
      
      try {
        const official = await dailyClosingService.getReport(date);
        if (official && official.id) {
          if (official.status === 'CLOSED') {
            return { report: official, status: 'CLOSED' };
          }
          // If REOPENED, we'll continue to fetch live sales below
          status = 'REOPENED';
        }
      } catch (err) {
        if (err?.response?.status !== 404) throw err;
        // 404 means it's still OPEN
      }

      // If we reach here, we need live sales (either OPEN or REOPENED status)
      const sales = await dailyClosingService.getTodaySales(date);
      let totalAmount = 0;
      let totalQuantity = 0;
      const productMap = {};

      for (const sale of sales) {
        totalAmount += sale.totalAmount ?? 0;
        for (const item of sale.items ?? []) {
          totalQuantity += item.quantity;
          if (!productMap[item.productId]) {
            productMap[item.productId] = {
              id: item.productId,
              product: item.product,
              soldQuantity: 0,
              saleAmount: 0,
              // Other fields will be derived/filled by UI components if needed
            };
          }
          productMap[item.productId].soldQuantity += item.quantity;
          productMap[item.productId].saleAmount += item.totalPrice ?? 0;
        }
      }

      return {
        report: {
          totalSalesAmount: totalAmount,
          totalSalesQuantity: totalQuantity,
          summaries: Object.values(productMap),
        },
        status,
      };
    },
    enabled: !!date,
    staleTime: 30000, // For daily report, 30s is fine to prevent excessive refreshing
  });
};

