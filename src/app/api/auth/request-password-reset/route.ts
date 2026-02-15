import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateEmail, generateMagicLinkToken } from "@/lib/auth";
import { BrevoService } from "@/lib/services/brevo.service";

const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestPasswordResetSchema.parse(body);

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
      },
    });

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we pretend to send an email
    if (!user) {
      return NextResponse.json({
        message:
          "If an account with that email exists, we have sent a login link.",
      });
    }

    // Invalidate any existing magic link tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        type: "magic_link",
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
      },
    });

    // Generate new magic link token
    const magicLinkToken = await generateMagicLinkToken(user.id);

    // Send login link email via Brevo
    try {
      await BrevoService.sendLoginLinkEmail(
        user.email,
        user.profile?.firstName || user.email.split("@")[0],
        magicLinkToken,
      );
    } catch (emailError) {
      console.error("Failed to send login link email:", emailError);
      // Don't expose email sending errors to the client
      // Still return success to prevent information leakage
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, we have sent a login link.",
    });
  } catch (error) {
    console.error("Login link request error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
