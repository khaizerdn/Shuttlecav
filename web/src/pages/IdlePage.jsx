// src/pages/IdlePage.jsx
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const IdlePage = ({ onNext }) => {
  const handleClick = () => {
    onNext({});
  };

  return (
    <div
      className="page-container"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      style={{
        backgroundColor: '#fff',
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