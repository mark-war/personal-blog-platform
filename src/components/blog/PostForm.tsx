// src/components/blog/PostForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "./MarkdownEditor";
import { Loader2, Save, Eye } from "lucide-react";

interface PostFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    published: boolean;
    tags: Array<{ name: string }>;
  };
}

export default function PostForm({ mode, initialData }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    published: initialData?.published || false,
    tags: initialData?.tags.map((t) => t.name).join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        coverImage: formData.coverImage || undefined,
        published: publish,
        tags,
      };

      const url =
        mode === "create" ? "/api/posts" : `/api/posts/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to posts list
      router.push("/dashboard/posts");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to save post");
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Post Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Enter an engaging title..."
          disabled={isLoading}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Excerpt (Optional)
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleChange("excerpt", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          rows={3}
          placeholder="A brief summary of your post..."
          disabled={isLoading}
        />
      </div>

      {/* Cover Image */}
      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cover Image URL (Optional)
        </label>
        <input
          id="coverImage"
          type="url"
          value={formData.coverImage}
          onChange={(e) => handleChange("coverImage", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="https://example.com/image.jpg"
          disabled={isLoading}
        />
        {formData.coverImage && (
          <div className="mt-3">
            <img
              src={formData.coverImage}
              alt="Cover preview"
              className="max-w-xs rounded-lg border border-gray-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange("tags", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="javascript, react, tutorial"
          disabled={isLoading}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <MarkdownEditor
          value={formData.content}
          onChange={(value) => handleChange("content", value)}
        />
      </div>

      {/* Actions */}
      <div className="bg-white sticky bottom-0 pt-6 pb-4 border-t">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition order-3 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save as Draft
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
