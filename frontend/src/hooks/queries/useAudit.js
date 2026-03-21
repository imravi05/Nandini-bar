import { useQuery } from '@tanstack/react-query';
import auditService from '../../services/audit.service';

const AUDIT_KEYS = {
  all: ['audit'],
  list: (params) => [...AUDIT_KEYS.all, 'list', params],
};

export const useAuditLogs = (params) => {
  return useQuery({
    queryKey: AUDIT_KEYS.list(params),
    queryFn: () => auditService.getLogs(params),
    keepPreviousData: true, // useful for pagination
  });
};
