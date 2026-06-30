import { getCurrentDbUser } from "./auth";

/**
 * Returns the current logged-in user (from the custom MongoDB session),
 * including this month's CREDIT_PURCHASE transactions used by credit logic.
 * Returns null when there is no valid session.
 */
export const checkUser = async () => {
  try {
    return await getCurrentDbUser({
      transactions: {
        where: {
          type: "CREDIT_PURCHASE",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    });
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
