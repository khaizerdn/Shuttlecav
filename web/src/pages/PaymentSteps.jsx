// src/components/PaymentSteps.jsx
import React, { useState, useEffect } from 'react';
import IdlePage from './IdlePage';
import RFIDScanPage from './RFIDScanPage';
import SelectAmount from './SelectAmount';
import CustomAmount from './CustomAmount';
import ConfirmationPage from './ConfirmationPage';
import { useIdleTimeout, IdleTimeoutHandler } from '../utils/useIdleTimeout.jsx';

const PaymentSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [rfidData, setRfidData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    setCurrentStep(1);
  }, []);

  const { timeLeft } = useIdleTimeout();

  useEffect(() => {
    if (timeLeft === 0) {
      resetState();
    }
  }, [timeLeft]);

  const resetState = () => {
    setCurrentStep(1);
    setSelectedAmount(null);
    setRfidData(null);
    setPaymentStatus(null);
  };

  const processPayment = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_id: rfidData,
          amount: selectedAmount,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus("success");
        setTimeout(() => resetState(), 2000); // Reset after 2 seconds
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setPaymentStatus(`Error: ${error.message}`);
      setTimeout(() => setPaymentStatus(null), 3000); // Clear error after 3 seconds
    }
  };

  const handleNext = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && data.rfid) {
      setRfidData(data.rfid);
      setCurrentStep(3);
    } else if (currentStep === 3 && data.amount) {
      setSelectedAmount(data.amount);
      setCurrentStep(5);
    } else if (currentStep === 3 && data.custom) {
      setCurrentStep(4);
    } else if (currentStep === 4 && data.amount) {
      setSelectedAmount(data.amount);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      processPayment();
    }
  };

  return (
    <div className="step-container">
      <IdleTimeoutHandler />
      {currentStep === 1 && <IdlePage onNext={handleNext} />}
      {currentStep === 2 && <RFIDScanPage onNext={handleNext} />}
      {currentStep === 3 && <SelectAmount onNext={handleNext} />}
      {currentStep === 4 && <CustomAmount onNext={handleNext} />}
      {currentStep === 5 && (
        <ConfirmationPage 
          amount={selectedAmount} 
          onNext={handleNext}
          paymentStatus={paymentStatus}
        />
      )}
    </div>
  );
};

export default PaymentSteps;