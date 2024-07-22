import React from "react";
import axios from "axios";
import { Button } from "@mui/material";

export const GoogleAuth1 = () => {
  const handleLogin = async () => {
    try {
      const response = await axios.get("/auth/google");
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      console.error("Error during Google authentication:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      className="btn btn-primary"
      onClick={handleLogin}
    >
      Sign in with Google
    </Button>
  );
};
