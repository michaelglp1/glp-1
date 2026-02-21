import { prisma } from "@/lib/prisma";
import { serverAnalytics } from "@/lib/analytics-server";

/**
 * Check if this is the user's first metric entry and track it
 */
export async function trackFirstMetricIfNeeded(
  userId: string,
  metricType: "weight" | "bp" | "blood_sugar" | "food" | "meds",
) {
  try {
    // Check if user has any previous metrics
    const [
      weightCount,
      bloodPressureCount,
      bloodSugarCount,
      glp1Count,
      foodCount,
    ] = await Promise.all([
      prisma.weight.count({ where: { profileId: userId } }),
      prisma.bloodPressure.count({ where: { profileId: userId } }),
      prisma.bloodSugar.count({ where: { profileId: userId } }),
      prisma.glp1Entry.count({ where: { profileId: userId } }),
      prisma.foodIntake.count({ where: { profileId: userId } }),
    ]);

    const totalMetrics =
      weightCount +
      bloodPressureCount +
      bloodSugarCount +
      glp1Count +
      foodCount;

    // If this is their first metric (count is 1 after creation), track it
    if (totalMetrics === 1) {
      await serverAnalytics.firstMetricEntry(userId, metricType);
      // Flush analytics to ensure event is sent
      await serverAnalytics.flush();
    }
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error("Error tracking first metric:", error);
  }
}
