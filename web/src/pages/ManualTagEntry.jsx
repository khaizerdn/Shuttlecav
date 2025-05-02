import shuttleCavLogo from '../assets/shuttlecav-logo.png';
import { useState } from 'react';
import '../index.css';

const ManualTagEntry = ({ onNext }) => {
  const [tagId, setTagId] = useState('');

  const handleSubmit = () => {
    if (tagId.trim()) {
      onNext({ rfid: tagId.trim() });
    } else {
      alert('Please enter a tag ID');
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
          <p>Enter your tag ID manually</p>
        </div>
      </div>
      <div className="right-container">
        <input
          type="text"
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
          placeholder="Enter Tag ID"
          className="tag-id-input"
        />
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default ManualTagEntry;