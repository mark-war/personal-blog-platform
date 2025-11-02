// src/app/api/posts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// GET /api/posts - Get all posts (with pagination and filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const published = searchParams.get("published") === "true";
    const authorId = searchParams.get("authorId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (published) where.published = true;
    if (authorId) where.authorId = authorId;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", session.user);

    const body = await request.json();
    console.log("Received post data:", body);

    const validatedData = postSchema.parse(body);

    // Generate slug from title
    const slug =
      validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    console.log("Creating post with slug:", slug);

    // Create post without tags first
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        coverImage: validatedData.coverImage || null,
        published: validatedData.published,
        publishedAt: validatedData.published ? new Date() : null,
        authorId: session.user.id,
      },
    });

    console.log("Post created:", post.id);

    // Handle tags separately if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      console.log("Processing tags:", validatedData.tags);

      for (const tagName of validatedData.tags) {
        try {
          // Try to find existing tag
          let tag = await prisma.tag.findUnique({
            where: { name: tagName },
          });

          // Create if doesn't exist
          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              },
            });
            console.log("Created new tag:", tag.name);
          }

          // Connect tag to post
          await prisma.post.update({
            where: { id: post.id },
            data: {
              tags: {
                connect: { id: tag.id },
              },
            },
          });
          console.log("Connected tag to post:", tag.name);
        } catch (tagError) {
          console.error("Error processing tag:", tagName, tagError);
          // Continue with other tags even if one fails
        }
      }
    }

    // Fetch the complete post with all relations
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    console.log("Post created successfully:", completePost?.id);

    return NextResponse.json(completePost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating post:", error);
    return NextResponse.json(
      {
        error: "Failed to create post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
