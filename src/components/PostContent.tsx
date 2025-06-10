import React from "react";

interface PostContentProps {
  title: string;
  description: string;
  imageUrl?: string;
  codeSnippet?: string;
  tags: string[];
  onClick?: () => void;
}

const PostContent: React.FC<PostContentProps> = ({
  title,
  description,
  imageUrl,
  codeSnippet,
  tags,
  onClick,
}) => (
  <div className="mt-8">
    <h2
      className="font-courier text-2xl font-bold my-4 hover:text-blue-600 cursor-pointer"
      onClick={onClick}
    >
      {title}
    </h2>
    <p className="text-gray-700 text-xl font-courier text-pretty text-justify mb-12">
      {description}
    </p>
    {imageUrl && (
      <div className="relative aspect-video mb-12">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${imageUrl}`}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
          onClick={onClick}
        />
      </div>
    )}
    {codeSnippet && (
      <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-12">
        <code>{codeSnippet}</code>
      </pre>
    )}
    <div className="flex flex-wrap gap-2 mb-12">
      {tags?.map((tag) => (
        <span
          key={tag}
          className="bg-blue-100 text-blue-500 text-xl font-courier text-pretty text-justify px-3 py-1 rounded-full text-md hover:bg-blue-200 cursor-pointer"
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);

export default PostContent;
