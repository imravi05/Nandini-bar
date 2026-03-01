import api from "./api";

/* Decode JWT payload without a library */
const parseJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};

/* Reads token from localStorage, decodes the JWT payload
   and merges it so callers can use user.role, user.userId etc. */
const getCurrentUser = () => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (!stored?.token) return null;
  const payload = parseJwt(stored.token);
  // payload: { userId, role, iat, exp }  |  stored also has: { name }
  return { token: stored.token, name: stored.name, ...payload };
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
