// src/pages/ConfirmationPage.jsx
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const ConfirmationPage = ({ amount, onNext }) => {
  const handleConfirm = () => {
    onNext({});
  };

  return (
    <div className="page-container">
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          <p>Confirm your amount</p>
        </div>
      </div>
      <div className="right-container">
        <div className="amount-display">
          {amount.toFixed(2)}
        </div>
        <button onClick={handleConfirm} className="enter-other-button">
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;