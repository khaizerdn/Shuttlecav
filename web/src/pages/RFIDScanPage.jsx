import React, { useState, useEffect, useRef } from 'react';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const RFIDScanPage = ({ onNext, onCancel }) => {
  const [status, setStatus] = useState('PLEASE SCAN YOUR RFID');
  const inputRef = useRef(null);
  const bufferRef = useRef('');

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

  const processInput = (raw) => {
    const value = raw.trim();
    let hexUID = '';

    if (/^\d+$/.test(value)) {
      const decimalUID = parseInt(value, 10);

      if (!isNaN(decimalUID) && decimalUID >= 0 && decimalUID <= 0xFFFFFFFF) {
        const buffer = new Uint8Array(4);
        buffer[0] = (decimalUID >> 24) & 0xff;
        buffer[1] = (decimalUID >> 16) & 0xff;
        buffer[2] = (decimalUID >> 8) & 0xff;
        buffer[3] = decimalUID & 0xff;

        hexUID = Array.from(buffer.reverse())
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join('');
      }
    } else if (/^[a-fA-F0-9]{8}$/.test(value)) {
      hexUID = value.toUpperCase();
    }

    if (hexUID) {
      setStatus(`RFID scanned successfully! Hex: ${hexUID}`);
      onNext({ rfid: hexUID });
    } else {
      console.warn('⚠️ Invalid or incomplete input:', value);
      setStatus('Invalid input. Please scan again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processInput(bufferRef.current);
      bufferRef.current = '';
      inputRef.current.value = '';
    } else {
      bufferRef.current += e.key;
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
              onKeyDown={handleKeyDown}
              ref={inputRef}
              style={{ position: 'absolute', left: '-9999px' }}
              aria-label="RFID Input"
            />
          </div>
        </div>
        <div className="button-container">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFIDScanPage;