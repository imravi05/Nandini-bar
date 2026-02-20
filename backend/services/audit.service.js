import prisma from "../config/prisma.js";

/* ---------------- CREATE AUDIT LOG ---------------- */

export const logAudit = async ({
  entityType,
  entityId,
  action,
  oldData,
  newData
}) => {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null
    }
  });
};

/* ---------------- GET AUDIT LOGS (WITH FILTERING) ---------------- */

export const getAuditLogs = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filters = {};

  if (query.entityType) {
    filters.entityType = query.entityType;
  }

  if (query.entityId) {
    filters.entityId = query.entityId;
  }

  if (query.startDate && query.endDate) {
    filters.createdAt = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate)
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.auditLog.count({ where: filters })
  ]);

  const formattedLogs = logs.map((log) => ({
    ...log,
    oldData: log.oldData ? JSON.parse(log.oldData) : null,
    newData: log.newData ? JSON.parse(log.newData) : null
  }));

  return {
    data: formattedLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};