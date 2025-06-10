import React, { useState, useEffect } from "react";
import { Post } from "../types";
import { BsThreeDots } from "react-icons/bs";

import CommentSection from "./CommentSection";
import { useNavigate } from "react-router-dom";
import {
  toggleLikePost,
  toggleHelpfulPost,
  shareContent,
  savePost,
  unsavePost,
  reportPost,
  deletePost,
} from "../api";
import PostHeader from "./PostHeader";
import PostDropdownMenu from "./PostDropdownMenu";
import PostContent from "./PostContent";
import PostStats from "./PostStats";
import PostActionsBar from "./PostActionsBar";
import PostLoginPrompt from "./PostLoginPrompt";

interface PostCardProps {
  post: Post & { onClick?: () => void };
  saved?: boolean; // <-- add this
  onUnsave?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onLikeHelpfulUpdate?: (postId: string, data: Partial<Post>) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  saved: savedProp = false,
  onUnsave,
  onDelete,
  onLikeHelpfulUpdate,
}) => {
  const {
    id,
    title,
    description,
    createdAt,
    likes,
    helpfulCount,
    comments,
    imageUrl,
    author,
    tags,
    onClick,
    codeSnippet,
  } = post;

  const [liked, setLiked] = useState(!!post.liked);
  const [helpful, setHelpful] = useState(!!post.helpful);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [helpfulCountState, setHelpfulCountState] = useState(post.helpfulCount);
  const [showComments, setShowComments] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const [saved, setSaved] = useState(savedProp);
  const [reported, setReported] = useState(false);

  const navigate = useNavigate();

  // Initialize savedPostIds from localStorage
  useEffect(() => {
    setLiked(!!post.liked);
    setHelpful(!!post.helpful);
    setLikeCount(post.likes);
    setHelpfulCountState(post.helpfulCount);
  }, [post]);

  // Remove the sync effect that updates local state from props after mount
  // Only set local state from props on initial mount
  useEffect(() => {
    setLiked(!!post.liked);
    setHelpful(!!post.helpful);
    setLikeCount(post.likes);
    setHelpfulCountState(post.helpfulCount);
    // eslint-disable-next-line
  }, []); // Only run once on mount

  // Handle like and helpful state changes
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    // Optimistic UI: update local state and parent state immediately
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    if (onLikeHelpfulUpdate)
      onLikeHelpfulUpdate(id, {
        liked: !liked,
        likes: liked ? likeCount - 1 : likeCount + 1,
      });
    try {
      const res = await toggleLikePost(id);
      setLiked(res.liked);
      setLikeCount(res.likes);
      if (onLikeHelpfulUpdate)
        onLikeHelpfulUpdate(id, { liked: res.liked, likes: res.likes });
    } catch (error) {
      // Revert to previous state if API fails
      setLiked(!!post.liked);
      setLikeCount(post.likes);
      if (onLikeHelpfulUpdate)
        onLikeHelpfulUpdate(id, { liked: !!post.liked, likes: post.likes });
    }
  };

  const handleHelpful = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    // Optimistic UI: update local state and parent state immediately
    setHelpful((prev) => !prev);
    setHelpfulCountState((prev) => (helpful ? prev - 1 : prev + 1));
    if (onLikeHelpfulUpdate)
      onLikeHelpfulUpdate(id, {
        helpful: !helpful,
        helpfulCount: helpful ? helpfulCountState - 1 : helpfulCountState + 1,
      });
    try {
      const res = await toggleHelpfulPost(id);
      setHelpful(res.helpful);
      setHelpfulCountState(res.helpfulCount);
      if (onLikeHelpfulUpdate)
        onLikeHelpfulUpdate(id, {
          helpful: res.helpful,
          helpfulCount: res.helpfulCount,
        });
    } catch (error) {
      // Revert to previous state if API fails
      setHelpful(!!post.helpful);
      setHelpfulCountState(post.helpfulCount);
      if (onLikeHelpfulUpdate)
        onLikeHelpfulUpdate(id, {
          helpful: !!post.helpful,
          helpfulCount: post.helpfulCount,
        });
    }
  };

  // Handle share functionality
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${id}`;
    const shareData = {
      title: title,
      text: description,
      url: shareUrl,
    };

    const success = await shareContent(shareData);
    if (success) {
      // Show a temporary success message
      const messageDiv = document.createElement("div");
      messageDiv.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg";
      messageDiv.textContent = "Link copied to clipboard!";
      document.body.appendChild(messageDiv);
      setTimeout(() => messageDiv.remove(), 2000);
    }
  };

  // Handle card click to navigate to post details
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).tagName === "BUTTON"
    ) {
      return;
    }
    if (onClick) onClick();
  };

  // Update saved state when savedProp changes
  useEffect(() => {
    setSaved(savedProp);
  }, [savedProp]);

  // Handle saving/unsaving the post
  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      if (!saved) {
        await savePost(id);
        setSaved(true);
        alert("Post saved!");
      } else {
        await unsavePost(id);
        setSaved(false);
        alert("Post unsaved!");
        if (onUnsave) onUnsave(id); // <-- remove from SavedPosts page
      }
    } catch (e) {
      alert("Failed to save/unsave post.");
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id);
      alert("Post deleted!");
      if (onDelete) onDelete(id); // <-- call parent handler
    } catch (e) {
      alert("Failed to delete post.");
    }
  };

  // Handle reporting the post
  const handleReport = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const reason = prompt("Why are you reporting this post? (optional)");
    try {
      await reportPost(id, reason || undefined);
      setReported(true);
      alert("Post reported! Thank you for your feedback.");
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to report post.");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById(`postcard-dropdown-${id}`);
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, id]);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PostHeader author={author} createdAt={createdAt} />
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <BsThreeDots className="w-5 h-5 text-gray-500" />
            </button>
            {showDropdown && isLoggedIn && (
              <PostDropdownMenu
                isAuthor={currentUser?.id === author?.id}
                saved={saved}
                reported={reported}
                onSave={handleSave}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
                onClose={() => setShowDropdown(false)}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <PostContent
          title={title}
          description={description}
          imageUrl={imageUrl}
          codeSnippet={codeSnippet}
          tags={tags || []}
          onClick={onClick}
        />

        {/* Stats */}
        <PostStats
          likeCount={likeCount}
          helpfulCount={helpfulCountState}
          commentCount={comments.length}
          liked={liked}
          helpful={helpful}
        />

        {/* Action Buttons */}
        <PostActionsBar
          liked={liked}
          helpful={helpful}
          likeCount={likeCount}
          helpfulCount={helpfulCountState}
          commentCount={comments.length}
          onLike={handleLike}
          onHelpful={handleHelpful}
          onComment={(e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
              setShowLoginPrompt(true);
              return;
            }
            setShowComments(!showComments);
          }}
          onShare={handleShare}
        />

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4">
            <CommentSection postId={id} />
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <PostLoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  );
};

export default PostCard;
