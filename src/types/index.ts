export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
  likes: number;
  helpfulCount: number;
  author: User;
  comments: Comment[];
  // Add these optional fields for UI state
  liked?: boolean;
  helpful?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: Date;
  avatarUrl?: string;
  imageUrl?: string;
  parentId?: string;
  // Add these fields for like/helpful functionality
  liked?: boolean;
  helpful?: boolean;
  likeCount: number;
  helpfulCount: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
}
