import React, { useEffect } from 'react';

const GoogleAuth = (props) => {
  useEffect(() => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('authtoken');
    
    if (authToken) {
      // Store the token in local storage
      sessionStorage.setItem('token', authToken);
      window.location.href = "/";
    } 
  }, [props]);
  
  const handleGoogleLogin = () => {
    // Redirect to the Google authentication endpoint on your backend
    window.location.href = `${props.apiUrl}/auth/google`;
    console.log(props.GoogleAuth);
  };

  return (
    <div className="d-grid gap-2">
      <button className="btn btn-danger btn-block" onClick={handleGoogleLogin}>
        <i className="bi bi-google"></i> Sign in with Google
      </button>
    </div>
  );
};

export default GoogleAuth;
