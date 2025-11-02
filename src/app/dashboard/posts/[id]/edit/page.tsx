// src/app/dashboard/posts/[id]/edit/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/blog/PostForm";

async function getPost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      tags: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    return null;
  }

  // Check if user owns the post
  if (post.authorId !== userId) {
    return null;
  }

  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return {
    title: "Edit Post - Dashboard",
    description: "Edit your blog post",
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const post = await getPost(id, session.user.id);

  if (!post) {
    notFound();
  }

  // Transform the post data to match PostForm's expected types
  const postData = {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    coverImage: post.coverImage ?? undefined,
    published: post.published,
    tags: post.tags,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
        <p className="text-gray-600">Make changes to your blog post</p>
      </div>

      <PostForm mode="edit" initialData={postData} />
    </div>
  );
}
