import React from "react";
import LikeLine from "../assets/icons/like-1.svg?react";
import LikeSolid from "../assets/icons/like-2.svg?react";
import HelpfulLine from "../assets/icons/love-1.svg?react";
import HelpfulSolid from "../assets/icons/love-2.svg?react";
import CommentSolid from "../assets/icons/comments-1.svg?react";
import { FiShare2 } from "react-icons/fi";

interface PostActionsBarProps {
  liked: boolean;
  helpful: boolean;
  likeCount: number;
  helpfulCount: number;
  commentCount: number;
  onLike: (e: React.MouseEvent) => void;
  onHelpful: (e: React.MouseEvent) => void;
  onComment: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

const PostActionsBar: React.FC<PostActionsBarProps> = ({
  liked,
  helpful,
  likeCount,
  helpfulCount,
  commentCount,
  onLike,
  onHelpful,
  onComment,
  onShare,
}) => (
  <div className="flex items-center justify-between border-t border-b py-2 text-xl font-courier">
    <button
      onClick={onLike}
      className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
        liked ? "text-blue-600 font-semibold" : "text-gray-600"
      }`}
      type="button"
    >
      {liked ? (
        <LikeSolid className="w-6 h-6 text-blue-600" />
      ) : (
        <LikeLine className="w-6 h-6" />
      )}
      <span>{likeCount > 0 ? likeCount : ""} Like</span>
    </button>
    <button
      onClick={onHelpful}
      className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
        helpful ? "text-pink-600 font-semibold" : "text-gray-600"
      }`}
      type="button"
    >
      {helpful ? (
        <HelpfulSolid className="w-6 h-6 text-pink-600" />
      ) : (
        <HelpfulLine className="w-6 h-6" />
      )}
      <span>{helpfulCount > 0 ? helpfulCount : ""} Helpful</span>
    </button>
    <button
      onClick={onComment}
      className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
      type="button"
    >
      <CommentSolid className="w-6 h-6" />
      <span>{commentCount > 0 ? commentCount : ""} Comment</span>
    </button>
    <button
      onClick={onShare}
      className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
      type="button"
    >
      <FiShare2 className="w-6 h-6" />
      Share
    </button>
  </div>
);

export default PostActionsBar;
