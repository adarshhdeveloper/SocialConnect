import axios from "axios";

// Direct backend communication URL
// In development, uses localhost:3000, or ngrok if specified in VITE_API_BASE
const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * 1. Health check
 */
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

/**
 * 2. Get connected Instagram profile
 */
export const getInstagramProfile = async () => {
  const response = await api.get("/api/instagram/me");
  return response.data;
};

/**
 * 3. Get connected accounts from DB
 */
export const getConnectedAccounts = async () => {
  const response = await api.get("/api/instagram/accounts");
  return response.data;
};

/**
 * 4. Get posts history from SQLite DB
 */
export const getPostsHistory = async () => {
  const response = await api.get("/api/instagram/posts");
  return response.data;
};

/**
 * 5. Publish post to Instagram
 */
export const publishPost = async ({ imageUrl, caption }) => {
  const response = await api.post("/api/instagram/posts", { imageUrl, caption });
  return response.data;
};

/**
 * 6. Delete post record from local history
 */
export const deletePostRecord = async (id) => {
  const response = await api.delete(`/api/instagram/posts/${id}`);
  return response.data;
};

/**
 * 7. Disconnect account
 */
export const disconnectAccount = async (igUserId) => {
  const response = await api.delete(`/api/instagram/accounts/${igUserId}`);
  return response.data;
};

/**
 * OAuth Connect URL helper
 */
export const getConnectUrl = () => {
  return `${API_BASE_URL}/api/instagram/connect`;
};

export default api;
