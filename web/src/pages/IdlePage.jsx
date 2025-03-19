// src/pages/IdlePage.jsx
import { useNavigate } from 'react-router-dom';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const IdlePage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/select-amount');
  };

  return (
    <div
      className="page-container"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      style={{
        backgroundColor: '#fff', // Override the default flex layout for full-screen
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
        <img
          src={shuttleCavLogo}
          alt="ShuttleCav Logo"
          style={{
            width: '400px',
            marginBottom: '20px',
          }}
        />
        <p
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase',
          }}
        >
          Tap Anywhere to Start
        </p>
      </div>
  );
};

export default IdlePage;