// src/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: [],
        query: "",
        total: 0,
      });
    }

    // Search in title and content
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      posts,
      query,
      total: posts.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    );
  }
}
