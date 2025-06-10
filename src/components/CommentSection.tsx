import React, { useEffect, useState } from "react";
import {
  fetchComments,
  addComment,
  editComment,
  deleteComment,
  toggleCommentLike,
  toggleCommentHelpful,
} from "../api";
import { Comment } from "../types";

import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import CommentAvatar from "./CommentAvatar";

interface CommentSectionProps {
  postId: string;
  parentId?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  parentId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);

  // Check if user is logged in
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = (await fetchComments(postId)) as Comment[];
        // Always use backend's liked/helpful for each comment (fixes icon state bug)
        setComments(
          data.filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
        );
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId, parentId]);

  const handleAddComment = async (replyParentId?: string) => {
    if (!newComment.trim() && !image) return;

    try {
      const commentData = {
        content: newComment,
        image: image || undefined,
        parentId: replyParentId || undefined,
      };
      await addComment(postId, commentData);

      // Always reload comments from backend after add (fixes nested reply and icon state bugs)
      setLoading(true);
      const data = (await fetchComments(postId)) as Comment[];
      setComments(
        data.filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
      );

      // Reset form
      setNewComment("");
      setImage(null);
      setImagePreview(null);
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditComment = async (commentId: string) => {
    setEditingComment(commentId);
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setEditText(comment.content);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      const updatedComment = await editComment(commentId, editText);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: updatedComment.content } : c
        )
      );
      setEditingComment(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Like/Helpful handlers for comments
  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) return;
    try {
      await toggleCommentLike(commentId);
      // Reload comments from backend for correct liked state
      setLoading(true);
      const data = (await fetchComments(postId)) as Comment[];
      setComments(
        data.filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
      );
    } catch (error) {
      // Optionally revert or show error
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulComment = async (commentId: string) => {
    if (!isLoggedIn) return;
    try {
      await toggleCommentHelpful(commentId);
      // Reload comments from backend for correct helpful state
      setLoading(true);
      const data = (await fetchComments(postId)) as Comment[];
      setComments(
        data.filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
      );
    } catch (error) {
      // Optionally revert or show error
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (commentId: string) => {
    const commentToShare = comments.find((c) => c.id === commentId);
    if (!commentToShare) return;

    const shareUrl = `${window.location.origin}/post/${postId}?comment=${commentId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared Comment",
          text: commentToShare.content,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        setShowShareModal(commentId);
        setTimeout(() => setShowShareModal(null), 2000);
      }
    } catch (error) {
      console.error("Error sharing comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            isDropdownOpen={showDropdown === comment.id}
            onDropdownToggle={() =>
              setShowDropdown(showDropdown === comment.id ? null : comment.id)
            }
            onEdit={() => handleEditComment(comment.id)}
            onDelete={() => handleDeleteComment(comment.id)}
            onLike={() => handleLikeComment(comment.id)}
            onHelpful={() => handleHelpfulComment(comment.id)}
            onReply={() => setReplyTo(comment.id)}
            onShare={() => handleShare(comment.id)}
            showShareModal={showShareModal === comment.id}
            isEditing={editingComment === comment.id}
            editText={editText}
            onEditTextChange={(e) => setEditText(e.target.value)}
            onSaveEdit={() => handleSaveEdit(comment.id)}
            onCancelEdit={() => {
              setEditingComment(null);
              setEditText("");
            }}
            isLoggedIn={isLoggedIn}
            replyTo={replyTo}
            newComment={newComment}
            onReplyInputChange={(e) => setNewComment(e.target.value)}
            onReplySubmit={() => handleAddComment(comment.id)}
            onReplyCancel={() => {
              setReplyTo(null);
              setNewComment("");
              setImage(null);
              setImagePreview(null);
            }}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onRemoveImage={() => {
              setImage(null);
              setImagePreview(null);
            }}
          >
            {/* Nested comments */}
            <div className="ml-8 mt-4">
              <CommentSection postId={postId} parentId={comment.id} />
            </div>
          </CommentItem>
        ))}
      </ul>

      {/* Main comment input - only show at top level */}
      {isLoggedIn && !parentId && !replyTo && (
        <div className="flex gap-3 items-start bg-white rounded-lg shadow p-4">
          <CommentAvatar author={user} />
          <div className="flex-1">
            <CommentInput
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onImageChange={handleImageChange}
              imagePreview={imagePreview}
              onRemoveImage={() => {
                setImage(null);
                setImagePreview(null);
              }}
              onSubmit={() => handleAddComment()}
            />
          </div>
        </div>
      )}

      {!isLoggedIn && !parentId && (
        <div className="text-center p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600">
            Please{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              log in
            </a>{" "}
            to comment.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
