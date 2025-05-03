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
    setStatus('Waiting for RFID scan...');
    setIsScanning(true);
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
          } else if (data.message === 'No card detected') {
            setStatus('Waiting for RFID scan...');
          } else {
            setStatus(`Error: ${data.message}. Please try again.`);
            setIsScanning(false);
          }
        } catch (error) {
          setStatus('Error: Failed to connect to server. Please try again.');
          setIsScanning(false);
        }
      }, 1000); // Poll every 1 second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, onNext]);

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