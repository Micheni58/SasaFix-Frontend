// src/hooks/useGeolocation.js
import { useState, useCallback } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const get = useCallback(() => {
    if (!navigator.geolocation) { setError("Not supported"); return; }
    setLoading(true); setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLoading(false); },
      ()  => { setError("Location access denied"); setLoading(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const clear = useCallback(() => { setLocation(null); setError(null); }, []);
  return { location, loading, error, get, clear };
};