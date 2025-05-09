import React, { useState, useEffect, useRef } from 'react';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const RFIDScanPage = ({ onNext }) => {
  const [status, setStatus] = useState('PLEASE SCAN YOUR RFID');
  const inputRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    input.focus();

    const handleFocus = () => {
      if (document.activeElement !== input) {
        input.focus();
      }
    };

    document.addEventListener('click', handleFocus);
    return () => {
      document.removeEventListener('click', handleFocus);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]{8}$/.test(value)) {
      setStatus('RFID scanned successfully!');
      inputRef.current.value = '';
      onNext({ rfid: value });
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
        </div>
      </div>
      <div className="right-containerbox">
        <div className="right-container">
          <div className="tag-id-input">
            <p>{status}</p>
            <input
              type="text"
              onChange={handleInputChange}
              ref={inputRef}
              style={{ position: 'absolute', left: '-9999px' }}
              aria-label="RFID Input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFIDScanPage;