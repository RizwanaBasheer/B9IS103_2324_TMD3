import React from 'react';
import { Button, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
//   const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.get('/auth/google');
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      console.error("Error during Google authentication:", error);
    }
  };

  return (
    <div className="text-center mt-5">
      <Typography variant="h3" gutterBottom>
        Chat App
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        className="btn btn-primary"
        onClick={handleLogin}
      >
        Sign in with Google
      </Button>
    </div>
  );
}

export default Home;
