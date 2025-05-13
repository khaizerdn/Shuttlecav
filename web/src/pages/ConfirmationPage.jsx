import React, { useEffect, useState } from 'react';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const ConfirmationPage = ({ amount, rfid, onNext, onCancel }) => {
  const [userData, setUserData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/get-user?tag_id=${rfid}`);
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
        } else {
          setError(data.message || 'User not found');
        }
      } catch (err) {
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [rfid]);

  const handleConfirm = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tag_id: rfid, amount }),
      });

      const data = await response.json();
      if (data.success) {
        setPaymentStatus("success");
        setUserData(null); // Remove user info on success
        setTimeout(() => onNext({ paymentStatus: "success" }), 2000);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus(`Error: ${error.message}`);
      setTimeout(() => setPaymentStatus(null), 3000);
    }
  };

  const currentDate = new Date().toLocaleDateString();

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
          {paymentStatus === 'success' ? (
            <div className="payment-status">Transaction Complete</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : userData ? (
            <>
              <div className="confirmation-details">
                <p><strong>Full Name:</strong> {userData.firstname} {userData.middleinitial} {userData.surname}</p>
                <p><strong>NFC Card ID:</strong> {rfid}</p>
                <p><strong>Date:</strong> {currentDate}</p>
                <p><strong>Amount:</strong> {amount.toFixed(2)}</p>
              </div>
              {paymentStatus && (
                <div className="payment-status">{paymentStatus}</div>
              )}
            </>
          ) : (
            <div className="loading-message">Loading user data...</div>
          )}
        </div>

        {/* Show buttons only when there's no successful payment */}
        {paymentStatus !== 'success' && (
          <div className="button-container">
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="enter-other-button"
              disabled={!userData || paymentStatus !== null}
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
