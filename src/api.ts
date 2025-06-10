import axios from "axios";
import { Post, Comment } from "./types";

// Get the backend URL from environment variables with fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with default config
export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Fetch post details by ID
export const fetchPostDetails = async (id: string): Promise<Post> => {
  const response = await api.get<Post>(`/posts/${id}`);
  return response.data;
};

// Fetch comments for a post
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  const res = await api.get<Comment[]>(`/comments/post/${postId}`);
  return res.data;
};

// Add comment to a post
export const addComment = async (
  postId: string,
  commentData: { content: string; image?: File; parentId?: string }
): Promise<Comment> => {
  const formData = new FormData();
  formData.append("content", commentData.content);
  if (commentData.image) {
    formData.append("image", commentData.image);
  }
  if (commentData.parentId) {
    formData.append("parentId", commentData.parentId);
  }
  const res = await api.post<Comment>(`/comments/post/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Edit a comment
export const editComment = async (
  commentId: string,
  content: string
): Promise<Comment> => {
  const res = await api.put<Comment>(`/comments/${commentId}`, { content });
  return res.data;
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

// Toggle like for a comment
export const toggleCommentLike = async (
  commentId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const res = await api.post<{ liked: boolean; likeCount: number }>(
    `/comments/${commentId}/like`
  );
  return res.data;
};

// Toggle helpful for a comment
export const toggleCommentHelpful = async (
  commentId: string
): Promise<{ helpful: boolean; helpfulCount: number }> => {
  const res = await api.post<{ helpful: boolean; helpfulCount: number }>(
    `/comments/${commentId}/helpful`
  );
  return res.data;
};

// Fetch like post
export const likePost = async (postId: string): Promise<number> => {
  const res = await api.post<{ likes: number }>(`/posts/${postId}/like`);
  return res.data.likes;
};

// Fetch helpful post
export const helpfulPost = async (postId: string): Promise<number> => {
  const res = await api.post<{ helpfulCount: number }>(
    `/posts/${postId}/helpful`
  );
  return res.data.helpfulCount;
};

// Toggle like post
export const toggleLikePost = async (
  postId: string
): Promise<{ liked: boolean; likes: number }> => {
  const res = await api.post<{ liked: boolean; likes: number }>(
    `/posts/${postId}/like`
  );
  return res.data;
};

// Toggle helpful post
export const toggleHelpfulPost = async (
  postId: string
): Promise<{ helpful: boolean; helpfulCount: number }> => {
  const res = await api.post<{ helpful: boolean; helpfulCount: number }>(
    `/posts/${postId}/helpful`
  );
  return res.data;
};

// Share functionality
export const shareContent = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
    await navigator.clipboard.writeText(data.url);
    return true;
  } catch (error) {
    console.error("Error sharing content:", error);
    return false;
  }
};

// Save and unsave post
export const savePost = async (postId: string) => {
  const res = await api.post(`/posts/${postId}/save`);
  return res.data;
};
export const unsavePost = async (postId: string) => {
  const res = await api.post(`/posts/${postId}/unsave`);
  return res.data;
};

// Report post
export const reportPost = async (postId: string, reason?: string) => {
  const res = await api.post("/reports", { postId, reason });
  return res.data;
};

// Edit a post
export const editPost = async (postId: string, formData: FormData) => {
  const res = await api.put(`/posts/${postId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete a post
export const deletePost = async (postId: string) => {
  const res = await api.delete(`/posts/${postId}`);
  return res.data;
};

// Fetch notifications
export const fetchNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  await api.post("/notifications/mark-all-read");
};
