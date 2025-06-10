import React from "react";
import TagSelector from "./TagSelector";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onTagSelect?: (tag: string) => void;
  recentPosts?: { id: string; title: string }[];
  popularTopics?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  onTagSelect,
  recentPosts = [],
  popularTopics = [],
}) => {
  const navigate = useNavigate();

  // When a tag is clicked, navigate to /posts?tag=TAGNAME
  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
    }
    navigate(`/posts?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <aside className="w-1/4 p-4 bg-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Tags</h2>
        <TagSelector onSelectTag={handleTagClick} />
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold">Recent Posts</h2>
        <ul>
          {recentPosts.map((post) => (
            <li className="py-2" key={post.id}>
              <a
                href={`/post/${post.id}`}
                className="text-blue-600 hover:underline"
              >
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-bold">Popular Topics</h2>
        <ul>
          {popularTopics.map((topic) => (
            <li className="py-2" key={topic}>
              <button
                className="text-blue-600 hover:underline bg-transparent border-none p-0 m-0"
                onClick={() => handleTagClick(topic)}
              >
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
