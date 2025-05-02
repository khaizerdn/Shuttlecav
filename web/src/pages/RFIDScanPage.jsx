import React, { useState, useEffect } from 'react';

const RFIDScanPage = ({ onNext }) => {
  const [status, setStatus] = useState('Click "Start Scan" to begin');
  const [serialPort, setSerialPort] = useState(null);
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
    let port;
    let reader;

    try {
      port = await navigator.serial.requestPort({});
      await port.open({ baudRate: 9600 });

      setSerialPort(port);
      setStatus('Waiting for RFID scan...');
      setIsScanning(true);

      reader = port.readable.getReader();

      while (port.readable) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('RFID:')) {
            const rfid = line.replace('RFID:', '').trim();
            sessionStorage.setItem('rfidData', rfid);
            setStatus('RFID scanned successfully!');
            setTimeout(() => {
              onNext({ rfid });
            }, 1000);
            return;
          } else if (line === 'READY') {
            setStatus('Waiting for RFID scan...');
          }
        }
      }
    } catch (error) {
      setStatus(`Error: ${error.message}. Please try again.`);
      setIsScanning(false);
    } finally {
      if (reader) reader.releaseLock();
      if (port) await port.close().catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      if (serialPort) {
        serialPort.close().catch(() => {});
      }
    };
  }, [serialPort]);

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