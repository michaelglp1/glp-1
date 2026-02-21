import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serverAnalytics } from "@/lib/analytics-server";

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

    // Track welcome_email_click (magic link from welcome email)
    await serverAnalytics.welcomeEmailClick(result.userId);

    // Flush analytics to ensure event is sent
    await serverAnalytics.flush();

    // Get user details with profile
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isComplete: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's current subscription with plan details (same as regular login)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const subscriptionData = subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            description: subscription.plan.description,
            price: subscription.plan.price,
            currency: subscription.plan.currency,
            interval: subscription.plan.interval,
            features: subscription.plan.features,
          },
        }
      : null;

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
      },
      profile: user.profile,
      subscription: subscriptionData,
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
