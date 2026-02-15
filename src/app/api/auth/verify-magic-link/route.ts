import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify the magic link token
    const result = await verifyMagicLinkToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired token" },
        { status: 400 },
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate JWT token for authentication
    const authToken = await generateToken({
      userId: user.id,
      email: user.email,
    });

    // Always redirect to /home
    const redirectTo = "/home";

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        isProfileComplete: user.profile?.isComplete || false,
      },
    });

    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Magic link verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
