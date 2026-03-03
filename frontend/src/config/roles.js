export const ROLES = {
  ADMIN: "ADMIN",
  INVENTORY: "INVENTORY", // Represents "Inventory Manager" from DB
  CASHIER: "CASHIER",
};

// 1. Route Access Blueprint (Sidebar & URL Protection)
export const ROLE_ROUTES = {
  [ROLES.ADMIN]: [
    "/", // Dashboard
    "/products",
    "/inventory",
    "/sales",
    "/daily",
    "/audit",
  ],
  [ROLES.INVENTORY]: ["/products", "/inventory", "/sales", "/audit"],
  [ROLES.CASHIER]: ["/sales", "/daily"],
};

// 2. Action Blueprint (Protecting specific buttons inside pages)
export const ROLE_ACTIONS = {
  [ROLES.ADMIN]: ["VOID_SALE", "DELETE_PRODUCT", "REOPEN_DAY", "EDIT_PRICE"],
  [ROLES.INVENTORY]: ["VOID_SALE", "EDIT_PRICE"],
  [ROLES.CASHIER]: [
    // Cashier cannot do any of the above sensitive actions
  ],
};

// --- Helper Utilities ---

export const normalizeRole = (roleStr) => {
  if (!roleStr) return ROLES.CASHIER;
  const upper = String(roleStr).toUpperCase();
  if (ROLES[upper]) return upper;
  return ROLES.CASHIER; // Safe fallback for unknown roles
};

export const canAccessRoute = (userRole, routePath) => {
  if (!userRole) return false;
  const normalizedRole = normalizeRole(userRole);
  const allowedRoutes = ROLE_ROUTES[normalizedRole] || [];
  return allowedRoutes.includes(routePath);
};

export const canPerformAction = (userRole, actionName) => {
  if (!userRole) return false;
  const normalizedRole = normalizeRole(userRole);
  const allowedActions = ROLE_ACTIONS[normalizedRole] || [];
  return allowedActions.includes(actionName);
};
