import React from "react";
import LikeLine from "../assets/icons/like-1.svg?react";
import LikeSolid from "../assets/icons/like-2.svg?react";
import HelpfulLine from "../assets/icons/love-1.svg?react";
import HelpfulSolid from "../assets/icons/love-2.svg?react";
import CommentSolid from "../assets/icons/comments-1.svg?react";
import { FiShare2 } from "react-icons/fi";

interface CommentActionsBarProps {
  liked: boolean;
  helpful: boolean;
  likeCount: number;
  helpfulCount: number;
  onLike: () => void;
  onHelpful: () => void;
  onReply: () => void;
  onShare: () => void;
  showShareModal: boolean;
}

const CommentActionsBar: React.FC<CommentActionsBarProps> = ({
  liked,
  helpful,
  likeCount,
  helpfulCount,
  onLike,
  onHelpful,
  onReply,
  onShare,
  showShareModal,
}) => (
  <div className="flex gap-4 mt-2 text-sm">
    <button
      onClick={onLike}
      className={`flex items-center gap-1 transition-colors ${
        liked
          ? "text-blue-600 font-semibold"
          : "text-gray-600 hover:text-blue-600"
      }`}
      type="button"
      aria-pressed={liked}
    >
      {liked === true ? (
        <LikeSolid className="w-4 h-4 text-blue-600" />
      ) : (
        <LikeLine className="w-4 h-4" />
      )}
      {likeCount > 0 && likeCount} Like
    </button>
    <button
      onClick={onHelpful}
      className={`flex items-center gap-1 transition-colors ${
        helpful
          ? "text-pink-600 font-semibold"
          : "text-gray-600 hover:text-pink-600"
      }`}
      type="button"
      aria-pressed={helpful}
    >
      {helpful === true ? (
        <HelpfulSolid className="w-4 h-4 text-pink-600" />
      ) : (
        <HelpfulLine className="w-4 h-4" />
      )}
      {helpfulCount > 0 && helpfulCount} Helpful
    </button>
    <button
      onClick={onReply}
      className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
    >
      <CommentSolid className="w-4 h-4" />
      Reply
    </button>
    <button
      onClick={onShare}
      className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
    >
      <FiShare2 className="w-4 h-4" />
      Share
    </button>
    {showShareModal && (
      <span className="text-green-600 animate-fade-in">Link copied!</span>
    )}
  </div>
);

export default CommentActionsBar;
