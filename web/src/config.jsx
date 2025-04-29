// src/config.jsx
import React, { useMemo } from 'react';

const configSettings = {
  idleTimeout: 60000, // 60 seconds in milliseconds
  showTimers: true, // Must be true to show the timer
};

const activeTimers = {
  idle: configSettings.showTimers,
};

const TimerDisplay = ({ timeLeft, label, isVisible, timerType }) => {
  const getTopOffset = useMemo(() => {
    if (!isVisible) return '0px';
    return '10px'; // Single timer at the top
  }, [isVisible]);

  const styles = `
    .timer-container-${timerType} {
      position: fixed;
      top: ${getTopOffset};
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 1rem;
      z-index: 2000;
      transition: opacity 0.3s ease;
    }
    .timer-container-${timerType}.expired {
      color: #ff4444;
    }
  `;

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return isVisible ? (
    <>
      <style>{styles}</style>
      <div
        className={`timer-container-${timerType} ${
          timeLeft === 0 ? 'expired' : ''
        }`}
      >
        {label}: {formatTime()}
      </div>
    </>
  ) : null;
};

export const config = {
  ...configSettings,
  TimerDisplay,
};