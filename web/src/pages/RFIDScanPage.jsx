import React, { useState, useEffect } from 'react';

const RFIDScanPage = ({ onNext }) => {
  const [status, setStatus] = useState('Click "Start Scan" to begin');
  const [isScanning, setIsScanning] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
    },
    heading: {
      marginBottom: '20px',
    },
    button: {
      marginTop: '20px',
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
    },
  };

  const startScanning = async () => {
    setIsScanning(true);
    setStatus('Waiting for RFID scan...');

    try {
      const response = await fetch('http://localhost:5000/api/read-rfid', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        const rfid = data.tag_id;
        sessionStorage.setItem('rfidData', rfid);
        setStatus('RFID scanned successfully!');
        setTimeout(() => {
          onNext({ rfid });
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to read RFID');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}. Please try again.`);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      // No cleanup needed for API-based scanning
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Scan Your RFID Card</h2>
      <p>{status}</p>
      {!isScanning && !status.includes('successfully') && (
        <button
          style={styles.button}
          onClick={startScanning}
          disabled={status.includes('Error') && !status.includes('try again')}
        >
          Start Scan
        </button>
      )}
      {status.includes('Error') && status.includes('try again') && (
        <button style={styles.button} onClick={startScanning}>
          Retry
        </button>
      )}
      <button
        style={styles.button}
        onClick={() => onNext({ manualEntry: true })}
      >
        Enter Tag ID Manually
      </button>
    </div>
  );
};

export default RFIDScanPage;