import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const CustomAmount = ({ onNext, onCancel }) => {
  const navigate = useNavigate();
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
      <button
        onClick={() => navigate('/users-manual')}
        className="help-button"
        aria-label="Help"
      >
        ?
      </button>
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
        </div>
      </div>
      <div className="right-containerbox">
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
        </div>
        <div className="button-container">
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSubmit} className="enter-other-button">
              Confirm
            </button>
          </div>
      </div>
    </div>
  );
};

export default CustomAmount;