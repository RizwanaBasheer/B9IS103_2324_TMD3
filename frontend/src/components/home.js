import React from 'react';
import { Typography } from '@mui/material';
import GoogleAuth from './GoogleAuth';

function Home(props) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'url(https://www.w3schools.com/w3images/mountains.jpg) no-repeat center center fixed',
    backgroundSize: 'cover',
    color: '#fff'
  };

  return (
    <div style={containerStyle}>
      <Typography variant="h3" gutterBottom>
        Chat App
      </Typography>
      <GoogleAuth apiUrl={props.apiUrl} />
    </div>
  );
}

export default Home;
