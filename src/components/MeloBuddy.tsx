import React from 'react';
import { motion } from 'framer-motion';

interface MeloBuddyProps {
  aura: 'none' | 'mantra' | 'love';
}

const MeloBuddy: React.FC<MeloBuddyProps> = ({ aura }) => {
  const getAuraColor = () => {
    switch (aura) {
      case 'mantra': return '#00ff41';
      case 'love': return '#ff7eb9';
      default: return '#ffb7c5';
    }
  };
  
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '80px',
        height: '80px',
        cursor: 'grab',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Aura */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: getAuraColor(),
          filter: 'blur(10px)',
        }}
      />

      
      {/* Mascot Body */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#ff7eb9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'none',
        boxShadow: '0 0 10px rgba(255,126,185,0.5)'
      }}>
        🐾
      </div>
    </motion.div>
  );
};

export default MeloBuddy;
