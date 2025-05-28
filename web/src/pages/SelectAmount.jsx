import { useNavigate } from 'react-router-dom';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const SelectAmount = ({ onNext, onCancel }) => {
  const navigate = useNavigate();
  const amounts = [
    { left: 100, right: 500 },
    { left: 200, right: 1000 },
    { left: 300, right: 1500 },
    { left: 400, right: 2000 },
  ];

  const handleAmountSelect = (amount) => {
    onNext({ amount });
  };

  const handleEnterOtherAmount = () => {
    onNext({ custom: true });
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
      <div className='right-containerbox'>
        <div className="right-container">
          <div className="amount-grid">
            {amounts.map((amountPair, index) => (
              <div key={index} className="amount-row">
                <button
                  onClick={() => handleAmountSelect(amountPair.left)}
                  className="amount-button"
                >
                  {amountPair.left}
                </button>
                <button
                  onClick={() => handleAmountSelect(amountPair.right)}
                  className="amount-button"
                >
                  {amountPair.right}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="button-container">
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleEnterOtherAmount} className="enter-other-button">
              Enter Other Amount
            </button>
          </div>
      </div>
    </div>
  );
};

export default SelectAmount;