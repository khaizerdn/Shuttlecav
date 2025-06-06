import { useNavigate } from 'react-router-dom';
import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import '../index.css';

const IdlePage = ({ onNext }) => {
  const navigate = useNavigate();
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
      }}
    >
      <button
        onClick={() => navigate('/users-manual')}
        className="help-button"
        aria-label="Help"
      >
        ?
      </button>
      <div className="idle-container">
        <div className="logo-container">
          <img src={shuttleCavLogo} alt="ShuttleCav Logo" />
        </div>
        <div className="description-container">
          <h1>ShuttleCav</h1>
          <p>
            Tap Anywhere to Start
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdlePage;