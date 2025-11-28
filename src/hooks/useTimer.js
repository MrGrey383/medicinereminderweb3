import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for countdown timer
 * @param {number} initialTime - Initial time in seconds
 * @param {function} onComplete - Callback when timer completes
 * @returns {object} Timer state and methods
 */
export const useTimer = (initialTime, onComplete) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time, onComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const addTime = (seconds) => {
    setTime((prevTime) => prevTime + seconds);
  };

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    addTime,
    minutes: Math.floor(time / 60),
    seconds: time % 60
  };
};

export default useTimer;