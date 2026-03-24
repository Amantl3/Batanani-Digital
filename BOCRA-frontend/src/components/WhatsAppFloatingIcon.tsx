import React, { useState, useEffect } from 'react';

interface WhatsAppFloatingIconProps {
  number: string; //  own number
}

const WhatsAppFloatingIcon: React.FC<WhatsAppFloatingIconProps> = ({ number }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false); 
  const waLink = `https://wa.me/${number.replace(/\+/g, '')}`;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500); // delay 0.5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
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
            marginBottom: 8,
            padding: '6px 12px',
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: 4,
            fontSize: 14,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          Chat with our chatbot?
        </div>
      )}

      {/* WhatsApp Icon */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: 60,
          height: 60,
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="Chat on WhatsApp"
          style={{ width: 32, height: 32 }}
        />
      </a>
    </div>
  );
};

export default WhatsAppFloatingIcon;