import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const SelectAmount = ({ onNext }) => {
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
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          {/* <p>Select the amount to load</p> */}
        </div>
      </div>
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
        <div className="button-container">
          <button onClick={handleEnterOtherAmount} className="enter-other-button">
            Enter Amount
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectAmount;