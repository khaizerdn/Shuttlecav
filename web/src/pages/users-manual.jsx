import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import K1 from '../assets/images/1.png';
import K2 from '../assets/images/2.png';
import K3 from '../assets/images/3.png';
import K4 from '../assets/images/4.png';
import K5 from '../assets/images/5.png';
import '../index.css';

const images = [K1, K2, K3, K4, K5];

const UsersManual = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollLeft / window.innerWidth);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <div className="manual-container">
      <button
        onClick={() => navigate('/')}
        className="back-button"
        aria-label="Back to main"
      >
        ← Back
      </button>
      <div
        ref={flatListRef}
        className="slideshow-container"
        onScroll={handleScroll}
      >
        {images.map((src, index) => (
          <div key={index} className="image-container">
            <img src={src} alt={`Slide ${index + 1}`} className="slide-image" />
          </div>
        ))}
      </div>
      <div className="page-indicator">
        <span className="page-text">{currentIndex + 1}/{images.length}</span>
      </div>
    </div>
  );
};

export default UsersManual;