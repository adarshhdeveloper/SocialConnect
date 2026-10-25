import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getInstagramProfile,
  getConnectedAccounts,
  getPostsHistory,
  publishPost as apiPublishPost,
  deletePostRecord as apiDeletePost,
  disconnectAccount as apiDisconnectAccount,
} from "../services/api";

const SocialContext = createContext(null);

export const SocialProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState(""); // status message for polling
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch all initial data from backend
  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile status
      try {
        const profRes = await getInstagramProfile();
        setProfile(profRes.connected ? profRes : null);
      } catch (err) {
        setProfile(null);
      }

      // 2. Fetch accounts list from SQLite DB
      try {
        const accRes = await getConnectedAccounts();
        setAccounts(accRes.accounts || []);
      } catch (err) {
        console.error("Failed to load accounts:", err.message);
      }

      // 3. Fetch posts history from SQLite DB
      try {
        const postsRes = await getPostsHistory();
        setPosts(postsRes.posts || []);
      } catch (err) {
        console.error("Failed to load posts:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Post publishing handler with progress feedback
  const handlePublishPost = async ({ imageUrl, caption }) => {
    setIsPublishing(true);
    setPublishStep("Uploading media container to Meta...");

    try {
      setPublishStep("Processing image on Instagram (waiting for FINISHED)...");
      const result = await apiPublishPost({ imageUrl, caption });

      setPublishStep("Published successfully!");
      showNotification("Post published to Instagram successfully!", "success");

      // Reload posts to reflect new SQLite entry
      await refreshData();
      return { success: true, data: result };
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to publish post to Instagram";
      showNotification(errMsg, "error");
      return { success: false, error: errMsg };
    } finally {
      setIsPublishing(false);
      setPublishStep("");
    }
  };

  // Delete post handler
  const handleDeletePost = async (id) => {
    try {
      await apiDeletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showNotification("Post record deleted from history", "success");
    } catch (err) {
      showNotification("Could not delete post record", "error");
    }
  };

  // Disconnect account handler
  const handleDisconnect = async (igUserId) => {
    try {
      await apiDisconnectAccount(igUserId);
      setProfile(null);
      setAccounts((prev) => prev.filter((a) => a.ig_user_id !== igUserId));
      showNotification("Instagram account disconnected successfully", "success");
    } catch (err) {
      showNotification("Could not disconnect account", "error");
    }
  };

  return (
    <SocialContext.Provider
      value={{
        profile,
        accounts,
        posts,
        loading,
        isPublishing,
        publishStep,
        notification,
        refreshData,
        publishPost: handlePublishPost,
        deletePost: handleDeletePost,
        disconnectAccount: handleDisconnect,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
};
