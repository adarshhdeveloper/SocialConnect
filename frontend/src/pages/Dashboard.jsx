import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AccountCard } from "../components/AccountCard";
import { PostComposer } from "../components/PostComposer";
import { LivePreview } from "../components/LivePreview";
import { HistoryFeed } from "../components/HistoryFeed";
import { useSocial } from "../context/SocialContext";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("composer");
  const [imageUrl, setImageUrl] = useState("https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg");
  const [caption, setCaption] = useState("Exploring new perspectives with SocialConnect! 🚀 #tech #photography #api");

  const { profile, accounts, notification } = useSocial();
  const currentUsername = profile?.username || accounts[0]?.username;

  return (
    <div className="flex h-screen bg-[#0B0F19] text-gray-100 overflow-hidden font-sans">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border transition-all animate-bounce">
          {notification.type === "success" ? (
            <div className="flex items-center gap-2 bg-emerald-950/90 border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl border">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">{notification.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-950/90 border-red-500/40 text-red-300 px-4 py-2.5 rounded-xl border">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold">{notification.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Layer 1: Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header / Account Banner */}
        <header className="p-8 pb-4">
          <AccountCard />
        </header>

        {/* Tab Views */}
        <div className="p-8 pt-4 flex-1">
          {activeTab === "composer" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form on the Left (7 cols) */}
              <div className="lg:col-span-7">
                <PostComposer
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  caption={caption}
                  setCaption={setCaption}
                />
              </div>

              {/* Instagram Live Phone Preview on the Right (5 cols) */}
              <div className="lg:col-span-5">
                <LivePreview
                  imageUrl={imageUrl}
                  caption={caption}
                  username={currentUsername}
                />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="max-w-4xl mx-auto">
              <HistoryFeed />
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="max-w-3xl mx-auto bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-2">Connected Accounts</h2>
              <p className="text-xs text-gray-400 mb-6">
                Accounts authenticated via official Meta OAuth with 60-day token persistence in SQLite.
              </p>

              {accounts.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">No accounts stored in database yet.</p>
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-4 bg-[#0B0F19] border border-gray-800 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-sm text-white">@{acc.username}</p>
                        <p className="text-xs text-gray-400">User ID: {acc.ig_user_id}</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Expires: {new Date(acc.token_expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
