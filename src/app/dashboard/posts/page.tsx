// src/app/dashboard/posts/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PostsTable from "@/components/blog/PostsTable";
import { Plus } from "lucide-react";

async function getUserPosts(userId: string) {
  return await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      tags: true,
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function PostsListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const posts = await getUserPosts(session.user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Posts</h1>
          <p className="text-gray-600">Manage all your blog posts</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Posts</p>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter((p: any) => p.published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Drafts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {posts.filter((p: any) => !p.published).length}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4 text-lg">No posts yet</p>
            <p className="text-gray-400 mb-6">
              Start creating amazing content for your blog
            </p>
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Post
            </Link>
          </div>
        ) : (
          <PostsTable posts={posts} />
        )}
      </div>
    </div>
  );
}
