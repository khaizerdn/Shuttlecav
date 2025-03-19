// src/utils/useIdleTimeout.jsx
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config.jsx';

export function useIdleTimeout() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(config.idleTimeout / 1000);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const resetTimeout = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setTimeLeft(config.idleTimeout / 1000);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTimeLeft(0);
    }, config.idleTimeout);
  }, []);

  // Optional: Keep navigation for route consistency
  useEffect(() => {
    if (timeLeft === 0) {
      navigate('/'); // Still navigates, but step reset is handled in PaymentSteps
    }
  }, [timeLeft, navigate]);

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimeout));

    resetTimeout();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetTimeout)
      );
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);

  return { timeLeft };
}

export function IdleTimeoutHandler() {
  const { timeLeft } = useIdleTimeout();

  return (
    <config.TimerDisplay
      timeLeft={timeLeft}
      label="Idle Timeout"
      isVisible={config.showTimers}
      timerType="idle"
    />
  );
}