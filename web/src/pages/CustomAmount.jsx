// src/pages/CustomAmount.jsx
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const CustomAmount = () => {
  const navigate = useNavigate();
  const [customAmount, setCustomAmount] = useState('');

  // Keypad buttons layout (flat array for 4x3 grid)
  const keypadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', '<',
  ];

  const handleKeypadClick = (value) => {
    if (value === '<') {
      // Backspace: remove the last character
      setCustomAmount((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      // Allow only one decimal point
      if (!customAmount.includes('.')) {
        setCustomAmount((prev) => prev + value);
      }
    } else {
      // Append the digit
      setCustomAmount((prev) => prev + value);
    }
  };

  const handleSubmit = () => {
    const amount = parseFloat(customAmount);
    if (customAmount && amount > 0) {
      console.log(`Custom amount submitted: ${amount}`);
      // Add navigation or further logic here (e.g., navigate to a confirmation page)
      // Example: navigate(`/confirm?amount=${amount}`);
    } else {
      alert('Please enter a valid amount greater than 0');
    }
  };

  return (
    <div className="page-container">
      {/* Left Container */}
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          <p>Select the amount to load</p>
        </div>
      </div>

      {/* Right Container */}
      <div className="right-container">
        {/* Input Field */}
        <div className="amount-display">
          {customAmount ? parseFloat(customAmount).toFixed(2) : '0.00'}
        </div>

        {/* Keypad Grid */}
        <div className="keypad-grid">
          {keypadButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleKeypadClick(button)}
              className="amount-button"
              aria-label={button === '<' ? 'Backspace' : `Enter ${button}`}
            >
              {button}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button onClick={handleSubmit} className="enter-other-button">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default CustomAmount;