import React from "react";
import { LayoutDashboard, Users, PlusCircle, History, Sparkles } from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "composer", label: "Composer", icon: PlusCircle },
    { id: "history", label: "History", icon: History },
    { id: "accounts", label: "Accounts", icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#111827]/70 backdrop-blur-xl border-r border-gray-800 flex flex-col justify-between p-6 select-none shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              SocialConnect
            </h1>
            <p className="text-xs text-purple-400 font-medium">Instagram Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-inner"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-gray-800/60 px-2 text-xs text-gray-500 space-y-1">
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Graph API v26.0 Active
        </p>
        <p className="text-[11px] text-gray-600">60-Day Token Persistence</p>
      </div>
    </aside>
  );
};
