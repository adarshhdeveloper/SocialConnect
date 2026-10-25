import { CheckCircle, ExternalLink, Unlink, RefreshCw, Camera } from "lucide-react";
import { useSocial } from "../context/SocialContext";
import { getConnectUrl } from "../services/api";

export const AccountCard = () => {
  const { profile, accounts, disconnectAccount, refreshData, loading } = useSocial();

  const active = profile || accounts[0];

  const handleConnect = () => {
    // Redirects directly to backend OAuth endpoint which handles Instagram authorization
    window.location.href = getConnectUrl();
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 shadow-2xl flex items-center justify-between">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-pink-500/10">
          <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center font-bold text-base text-white">
            {active?.username ? active.username[0]?.toUpperCase() : <Camera className="w-5 h-5 text-pink-400" />}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              {active?.username ? `@${active.username}` : "No Account Connected"}
            </h3>
            {active ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-2.5 h-2.5" /> 60-Day Token Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                Disconnected
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {active?.ig_user_id || active?.igUserId
              ? `User ID: ${active.ig_user_id || active.igUserId}`
              : "Connect your Instagram Professional account to start publishing"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={refreshData}
          title="Refresh status from backend"
          className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        {active ? (
          <button
            onClick={() => disconnectAccount(active.ig_user_id || active.igUserId)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Connect Instagram</span>
          </button>
        )}
      </div>
    </div>
  );
};
