import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const ConfirmationPage = ({ amount, onNext, paymentStatus }) => {
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
        </div>
      </div>
      <div className="right-containerbox">
        <div className="right-container">
          <div className="amount-display">
            {amount.toFixed(2)}
          </div>
          {paymentStatus && (
            <div className="payment-status">
              {paymentStatus === "success" 
                ? "Payment Successful!" 
                : paymentStatus}
            </div>
          )}
        </div>
        {!paymentStatus && (
          <div className="button-container">
            <button 
              onClick={handleConfirm} 
              className="enter-other-button"
              disabled={paymentStatus !== null}
            >
              Confirm Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;