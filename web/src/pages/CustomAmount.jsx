// src/pages/CustomAmount.jsx
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import { useState } from 'react';
import '../index.css';

const CustomAmount = ({ onNext }) => {
  const [customAmount, setCustomAmount] = useState('');

  const keypadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', '<',
  ];

  const handleKeypadClick = (value) => {
    if (value === '<') {
      setCustomAmount((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!customAmount.includes('.')) {
        setCustomAmount((prev) => prev + value);
      }
    } else {
      setCustomAmount((prev) => prev + value);
    }
  };

  const handleSubmit = () => {
    const amount = parseFloat(customAmount);
    if (customAmount && amount > 0) {
      onNext({ amount });
    } else {
      alert('Please enter a valid amount greater than 0');
    }
  };

  return (
    <div className="page-container">
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          <p>Select the amount to load</p>
        </div>
      </div>
      <div className="right-container">
        <div className="amount-display">
          {customAmount || ''}
        </div>
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
        <button onClick={handleSubmit} className="enter-other-button">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default CustomAmount;