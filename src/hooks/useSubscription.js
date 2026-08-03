// src/hooks/useSubscription.js

import { useState, useEffect, useCallback } from "react";
import subscriptionService from "../services/subscriptionService";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);

  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // Load subscription
  // ----------------------------
  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const subscription =
        await subscriptionService.getSubscription();

      const commission =
        await subscriptionService.getCommission();

      setSubscription(subscription);
      setCommissionRate(
        commission.commission_rate
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to load subscription."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------
  // Upgrade provider
  // ----------------------------
  const upgrade = useCallback(async () => {
    console.log("Starting upgrade...");

    try {
        setUpgrading(true);

        const response =
        await subscriptionService.upgradeToPremium();

        console.log("Upgrade response:", response);

        await loadSubscription();

        return true;
    } catch (err) {
        console.error("Upgrade error:", err);

        setError(
        err.response?.data?.detail ||
        err.message ||
        "Upgrade failed."
        );

        return false;
    } finally {
        setUpgrading(false);
    }
  }, [loadSubscription]);

  // ----------------------------
  // Load on mount
  // ----------------------------
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  return {
    subscription,
    commissionRate,

    loading,
    upgrading,
    error,

    refresh: loadSubscription,
    upgrade,
  };
};