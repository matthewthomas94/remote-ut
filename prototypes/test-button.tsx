
import React, { useState } from 'react';

// Design tokens match tokens.css:
// Primary color: #3866b0
// Text color: #283e48
// Radius: 0.375rem

export const TestButton = ({ label = "Submit Order" }) => {
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(false);

    const styles = {
        button: {
            backgroundColor: hover ? '#2d528f' : '#3866b0', // Darker on hover
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.8 : 1,
            transition: 'background-color 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Europa, sans-serif'
        },
        spinner: {
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    const handleClick = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <>
            <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
            <button
                style={styles.button}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleClick}
                disabled={loading}
            >
                {loading && <div style={styles.spinner}></div>}
                {loading ? 'Processing...' : label}
            </button>
        </>
    );
};

export default TestButton;
