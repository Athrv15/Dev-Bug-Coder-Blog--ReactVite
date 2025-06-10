import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, fetchPostDetails, editPost } from "../api";
import TagSelector from "../components/TagSelector";

const CreatePost: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [headline, setHeadline] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Edit mode: fetch post and pre-fill fields
  useEffect(() => {
    if (id) {
      fetchPostDetails(id).then((post) => {
        setHeadline(post.title);
        setErrorDescription(post.description);
        setSolution(post.content);
        setCodeSnippet(post.codeSnippet || "");
        setTags(post.tags || []);
        setImageUrl(post.imageUrl);
      });
    }
  }, [id]);

  const handleTagSelect = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (id) {
      // Edit mode
      const formData = new FormData();
      formData.append("title", headline); // was "headline"
      formData.append("description", errorDescription); // was "errorDescription"
      formData.append("content", solution); // was "solution"
      formData.append("codeSnippet", codeSnippet);
      formData.append("tags", JSON.stringify(tags));
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }
      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      try {
        await editPost(id, formData);
        alert("Post updated!");
        navigate("/posts");
      } catch (error) {
        alert("Failed to update post. Please try again.");
      }
    } else {
      // Create mode (your existing logic)
      // const formData = new FormData();
      // formData.append("title", headline);
      // formData.append("description", errorDescription);
      // formData.append("content", solution);
      // formData.append("codeSnippet", codeSnippet);
      // formData.append("tags", JSON.stringify(tags));
      // if (imageUrl) {
      //   formData.append("imageUrl", imageUrl);
      // }
      // In handleSubmit, for create mode:
      const formData = new FormData();
      formData.append("headline", headline); // not "title"
      formData.append("errorDescription", errorDescription);
      formData.append("solution", solution); // not "content"
      formData.append("codeSnippet", codeSnippet);
      formData.append("tags", JSON.stringify(tags));
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }
      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      try {
        await api.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Post created successfully!");
        navigate("/posts");
      } catch (error) {
        alert("Failed to create post. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto pt-24 px-4 pb-4">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edit Post" : "Create a New Post"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TagSelector onSelectTag={handleTagSelect} />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-200 text-blue-800 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div>
          <label className="block mb-1">Headline:</label>
          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Error Description:</label>
          <textarea
            value={errorDescription}
            onChange={(e) => setErrorDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Upload Screenshot:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setScreenshot(e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${imageUrl}`}
                alt="Current"
                className="h-32 rounded"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1">Solution:</label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Code Snippet:</label>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {id ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
