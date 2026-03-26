import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const TWILIO_NUMBER = "14155238886"; 
const JOIN_WORD = "evidence-toy";      
// ---------------------

interface WhatsAppFloatingIconProps {
  number?: string; 
}

const WhatsAppFloatingIcon: React.FC<WhatsAppFloatingIconProps> = () => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false); 
  
  // This creates the link that auto-fills the join command
  const waLink = `https://wa.me/${TWILIO_NUMBER}?text=join%20${JOIN_WORD}`;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20, // icon on bottom-right
        zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(100px)',
        transition: 'transform 0.5s ease-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            right: '100%', // show to the left of the icon
            bottom: 0,
            marginRight: 8,
            padding: '8px 14px',
            backgroundColor: '#1d1d1d',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          Chat with BOCRA Help Chat?
          {/* Arrow pointing to icon */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -6, // slightly outside tooltip
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '6px solid #1d1d1d',
            }}
          />
        </div>
      )}

      {/* WhatsApp Icon */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: 65,
          height: 65,
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="BOCRA Chat"
          style={{ width: 35, height: 35 }}
        />
      </a>
    </div>
  );
};

export default WhatsAppFloatingIcon;