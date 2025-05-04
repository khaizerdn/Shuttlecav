import React, { useState, useEffect } from 'react';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const RFIDScanPage = ({ onNext }) => {
  const [status, setStatus] = useState('PLEASE SCAN YOUR RFID');
  const [isScanning, setIsScanning] = useState(true);

  const cancelScanning = () => {
    setIsScanning(false);
    onNext({ manualEntry: true });
  };

  useEffect(() => {
    let intervalId;
    if (isScanning) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/read-rfid');
          const data = await response.json();

          if (data.success) {
            setStatus('RFID scanned successfully!');
            sessionStorage.setItem('rfidData', data.tag_id);
            setIsScanning(false);
            setTimeout(() => {
              onNext({ rfid: data.tag_id });
            }, 1000);
          } else {
            setStatus('PLEASE SCAN YOUR RFID');
          }
        } catch (error) {
          setStatus('PLEASE SCAN YOUR RFID');
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, onNext]);

  return (
    <div className="page-container">
      <div className="left-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          {/* <p>Please scan your RFID card</p> */}
        </div>
      </div>
      <div className="right-container">
      <div className="tag-id-input">
        {status}
      </div>
        <div className="button-container">
          <button
            onClick={cancelScanning}
            className="enter-other-button"
          >
            Or Enter Tag ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFIDScanPage;