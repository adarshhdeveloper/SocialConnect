import React, { useState } from "react";
import { Send, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useSocial } from "../context/SocialContext";

export const PostComposer = ({ imageUrl, setImageUrl, caption, setCaption }) => {
  const { publishPost, isPublishing, publishStep, profile, accounts } = useSocial();
  const [error, setError] = useState("");

  const activeAccount = profile?.username || accounts[0]?.username;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!activeAccount) {
      setError("Please connect an Instagram account first!");
      return;
    }

    if (!imageUrl.trim()) {
      setError("Please enter a valid public image URL.");
      return;
    }

    if (!imageUrl.startsWith("https://")) {
      setError("Image URL must use secure HTTPS protocol.");
      return;
    }

    if (!caption.trim()) {
      setError("Caption is required.");
      return;
    }

    if (caption.length > 2200) {
      setError("Caption cannot exceed 2200 characters.");
      return;
    }

    const res = await publishPost({ imageUrl, caption });
    if (res.success) {
      // Clear inputs upon successful post
      setImageUrl("");
      setCaption("");
    } else {
      setError(res.error || "Failed to publish post");
    }
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Post Composer</h2>
          <p className="text-xs text-gray-400">Publish content directly to your Instagram profile</p>
        </div>
        {activeAccount ? (
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Publishing as @{activeAccount}
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            No Account Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Public Image URL (HTTPS JPEG/PNG)
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isPublishing}
              className="w-full bg-[#0B0F19]/90 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <ImageIcon className="absolute right-3.5 top-3 w-4 h-4 text-gray-500" />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Meta requires directly accessible public images (e.g. Wikimedia Commons).
          </p>
        </div>

        {/* Caption Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-300">Caption</label>
            <span className={`text-[11px] ${caption.length > 2200 ? "text-red-400 font-bold" : "text-gray-500"}`}>
              {caption.length} / 2200
            </span>
          </div>
          <textarea
            rows="4"
            placeholder="Write an engaging caption with hashtags..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isPublishing}
            className="w-full bg-[#0B0F19]/90 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
          ></textarea>
        </div>

        {/* Progress status during polling */}
        {isPublishing && (
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
            <p className="text-xs text-purple-300 font-medium">{publishStep}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPublishing || !activeAccount}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
            isPublishing || !activeAccount
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing to Instagram...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Publish to Instagram</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
