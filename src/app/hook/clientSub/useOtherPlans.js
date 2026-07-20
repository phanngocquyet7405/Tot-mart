import { useEffect, useState } from "react";
import { SUBSCRIBE_PLANS } from "@/app/util/formatter";

/**
 * useOtherPlans
 * Fetches and returns available subscription plans that the user can upgrade/downgrade to.
 * Filters out the current subscription plan.
 */
export function useOtherPlans(currentPlanType = null) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Filter out current plan if provided
        const availablePlans = currentPlanType
          ? SUBSCRIBE_PLANS.filter((plan) => plan.planType !== currentPlanType)
          : SUBSCRIBE_PLANS;

        setPlans(availablePlans);
      } catch (err) {
        console.error("[useOtherPlans] Error loading plans:", err);
        setError(err.message || "Failed to load plans");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [currentPlanType]);

  return {
    plans,
    isLoading,
    error,
  };
}
