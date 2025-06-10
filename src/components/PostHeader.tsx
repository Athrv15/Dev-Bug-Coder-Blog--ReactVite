import React from "react";

interface PostHeaderProps {
  author: { name?: string; avatarUrl?: string; country?: string };
  createdAt: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({ author, createdAt }) => (
  <div className="flex items-center space-x-3">
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 bg-gray-200">
      <img
        src={
          author?.avatarUrl
            ? `${import.meta.env.VITE_BACKEND_URL}${author.avatarUrl}`
            : `https://robohash.org/${author?.name || "user"}.png?size=80x80`
        }
        alt={author?.name || "User"}
        className="w-full h-full object-cover"
      />
    </div>
    <div>
      <div className="font-semibold text-gray-900 font-courier text-xl">
        {author?.name || "User"}
      </div>
      <div className="font-courier text-md text-gray-500 flex items-center space-x-1">
        <span>{new Date(createdAt).toLocaleString()}</span>
        {author?.country && (
          <>
            <span>•</span>
            <span>{author.country}</span>
          </>
        )}
      </div>
    </div>
  </div>
);

export default PostHeader;
