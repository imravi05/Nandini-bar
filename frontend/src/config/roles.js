export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
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
  [ROLES.MANAGER]: ["/products", "/inventory", "/sales", "/audit"],
  [ROLES.CASHIER]: ["/sales", "/daily"],
};

// 2. Action Blueprint (Protecting specific buttons inside pages)
export const ROLE_ACTIONS = {
  [ROLES.ADMIN]: ["VOID_SALE", "DELETE_PRODUCT", "REOPEN_DAY", "EDIT_PRICE"],
  [ROLES.MANAGER]: ["VOID_SALE", "EDIT_PRICE"],
  [ROLES.CASHIER]: [
    // Cashier cannot do any of the above sensitive actions
  ],
};

// --- Helper Utilities ---

export const canAccessRoute = (userRole, routePath) => {
  if (!userRole) return false;
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  return allowedRoutes.includes(routePath);
};

export const canPerformAction = (userRole, actionName) => {
  if (!userRole) return false;
  const allowedActions = ROLE_ACTIONS[userRole] || [];
  return allowedActions.includes(actionName);
};
