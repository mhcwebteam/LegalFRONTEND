import React from 'react';
import { Container } from 'react-bootstrap';

const CardWithHeader = ({ title, children }) => {
    const isSmallScreen = window.innerWidth <= 1396;
    const screenWidth = window.innerWidth;

  return (
    <Container
      style={{
        backgroundColor: '#f0f0efff',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'relative',
        marginTop: '-18px',
        // paddingBottom: '30px'
        paddingBottom: screenWidth <= 1396 ? '10px': '30px'
      }}
    >
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          marginBottom: '30px',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '20px',
          backgroundColor: '#a8c5d1',
          margin: '-30px -30px 3px -30px',
          // padding: '10px 30px',
          padding: isSmallScreen <= 1396 ? '5px 30px' : '10px 30px',
          borderRadius: '8px 8px 0 0'
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#000000',
            fontSize: '28px',
            fontWeight: '600'
          }}
        >
          {title}
        </h2>
      </div>

      {children}
    </Container>
  );
};

export default CardWithHeader;
