import React, { useRef, useCallback } from 'react';
import './Features.css';

const FeatureCard = ({ children, spotlightColor = 'rgba(99, 102, 241, 0.2)' }) => {
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight Logic
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--spotlight-color', spotlightColor);

    // Border Glow Proximity & Angle Logic
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    
    // Proximity (0 to 1)
    const edgeX = cx / Math.abs(dx || 1);
    const edgeY = cy / Math.abs(dy || 1);
    const proximity = Math.min(Math.max(1 / Math.min(edgeX, edgeY), 0), 1);
    
    // Angle
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    card.style.setProperty('--edge-proximity', proximity.toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  };

  return (
    <div 
      ref={cardRef} 
      onPointerMove={handlePointerMove}
      className="feature-card-wrapper"
    >
      <div className="feature-card-inner">
        {children}
      </div>
    </div>
  );
};

export default FeatureCard;