import { Heart, MessageCircle, Bookmark, Share2, Camera } from "lucide-react";

export const LivePreview = ({ imageUrl, caption, username }) => {
  const displayUser = username || "demo_creator";

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Live Instagram Preview
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
          <Camera className="w-3.5 h-3.5" /> Post Preview
        </span>
      </div>

      {/* Mock Instagram Phone Card */}
      <div className="w-full max-w-[340px] bg-black border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-xs text-white">
                {displayUser[0]?.toUpperCase() || "I"}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{displayUser}</p>
              <p className="text-[10px] text-gray-400">Instagram Professional</p>
            </div>
          </div>
          <span className="text-gray-500 text-xs">•••</span>
        </div>

        {/* Media Window */}
        <div className="w-full aspect-square bg-[#0D1117] flex items-center justify-center overflow-hidden relative">
          {imageUrl && imageUrl.startsWith("https://") ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="text-center p-6 text-gray-600 space-y-2">
              <Camera className="w-12 h-12 mx-auto stroke-[1.2]" />
              <p className="text-xs text-gray-500">Enter a public HTTPS image URL to see live preview</p>
            </div>
          )}
        </div>

        {/* Post Actions Bar */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-gray-300">
            <div className="flex items-center gap-3.5">
              <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
              <MessageCircle className="w-5 h-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Share2 className="w-5 h-5 hover:text-green-400 cursor-pointer transition-colors" />
            </div>
            <Bookmark className="w-5 h-5 hover:text-yellow-400 cursor-pointer transition-colors" />
          </div>

          {/* Caption Preview */}
          <div className="text-xs text-gray-200 leading-snug break-words">
            <span className="font-semibold text-white mr-1.5">{displayUser}</span>
            <span className="text-gray-300 whitespace-pre-wrap">
              {caption || "Your post caption will appear here with hashtags and formatting..."}
            </span>
          </div>

          <p className="text-[10px] text-gray-500 uppercase tracking-wider pt-1">
            Just now • via SocialConnect
          </p>
        </div>
      </div>
    </div>
  );
};
