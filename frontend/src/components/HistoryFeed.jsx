import React from "react";
import { ExternalLink, CheckCircle2, XCircle, Clock, Trash2, ImageOff } from "lucide-react";
import { useSocial } from "../context/SocialContext";

export const HistoryFeed = () => {
  const { posts, deletePost, loading } = useSocial();

  if (loading) {
    return (
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl flex items-center justify-center min-h-[300px]">
        <p className="text-xs text-gray-500 animate-pulse">Loading posts history from database...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Publishing History</h2>
          <p className="text-xs text-gray-400">Stored in SQLite database ({posts.length} records)</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
          <p className="text-xs text-gray-500">No published posts found in database yet.</p>
          <p className="text-[11px] text-gray-600 mt-1">Compose your first post using the form!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group bg-[#0B0F19]/80 border border-gray-800/80 hover:border-gray-700/80 rounded-xl p-3.5 flex items-center gap-4 transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-gray-900 border border-gray-800 overflow-hidden shrink-0">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageOff className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Caption & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.status === "published" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Published
                    </span>
                  )}
                  {post.status === "failed" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  {post.status === "pending" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500">{post.created_at}</span>
                </div>

                <p className="text-xs text-gray-300 truncate font-medium">{post.caption}</p>

                {post.error && (
                  <p className="text-[11px] text-red-400 truncate mt-0.5 font-mono">{post.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 transition-colors"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  onClick={() => deletePost(post.id)}
                  title="Delete record from local database"
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
