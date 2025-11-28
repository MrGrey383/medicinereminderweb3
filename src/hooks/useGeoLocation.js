import { useState, useEffect } from 'react';

/**
 * Custom hook for geolocation
 * @returns {object} Geolocation state
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setLoading(false);
    };

    const handleError = (error) => {
      setError(error.message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  return { location, error, loading };
};

export default useGeolocation;