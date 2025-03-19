// src/pages/PaymentSteps.jsx
import React, { useState, useEffect } from 'react';
import IdlePage from './IdlePage';
import SelectAmount from './SelectAmount';
import CustomAmount from './CustomAmount';
import ConfirmationPage from './ConfirmationPage';
import { useIdleTimeout, IdleTimeoutHandler } from '../utils/useIdleTimeout.jsx';

const PaymentSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);

  // Reset to step 1 on mount
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  const { timeLeft } = useIdleTimeout();

  // Reset to step 1 when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      setCurrentStep(1);
      setSelectedAmount(null); // Clear any selected amount
    }
  }, [timeLeft]);

  const handleNext = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && data.amount) {
      setSelectedAmount(data.amount);
      setCurrentStep(4);
    } else if (currentStep === 2 && data.custom) {
      setCurrentStep(3);
    } else if (currentStep === 3 && data.amount) {
      setSelectedAmount(data.amount);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      console.log('Payment complete with amount:', selectedAmount);
      setCurrentStep(1);
      setSelectedAmount(null);
    }
  };

  return (
    <div className="step-container">
      <IdleTimeoutHandler />
      {currentStep === 1 && <IdlePage onNext={handleNext} />}
      {currentStep === 2 && <SelectAmount onNext={handleNext} />}
      {currentStep === 3 && <CustomAmount onNext={handleNext} />}
      {currentStep === 4 && (
        <ConfirmationPage amount={selectedAmount} onNext={handleNext} />
      )}
    </div>
  );
};

export default PaymentSteps;