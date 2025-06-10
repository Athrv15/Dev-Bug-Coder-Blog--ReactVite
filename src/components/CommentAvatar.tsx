import React from "react";
import { Comment } from "../types";

interface CommentAvatarProps {
  author: Comment["author"];
}

const CommentAvatar: React.FC<CommentAvatarProps> = ({ author }) => (
  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
);

export default CommentAvatar;
