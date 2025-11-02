// src/app/dashboard/posts/new/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostForm from "@/components/blog/PostForm";

export const metadata = {
  title: "Create New Post - Dashboard",
  description: "Create a new blog post",
};

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Post
        </h1>
        <p className="text-gray-600">Share your thoughts with the world</p>
      </div>

      <PostForm mode="create" />
    </div>
  );
}
