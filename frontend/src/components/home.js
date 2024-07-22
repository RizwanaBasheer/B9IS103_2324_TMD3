import React from "react";
import { Button, Typography } from "@mui/material";
// import { useNavigate } from 'react-router-dom';
import { GoogleAuth1 } from "./GoogleAuth1";
import { GoogleAuth2 } from "./GoogleAuth2";
import { GoogleAuth3 } from "./GoogleAuth3";

function Home() {
  //   const navigate = useNavigate();

  return (
    <div className="text-center mt-5">
      <Typography variant="h3" gutterBottom>
        Chat App
      </Typography>
      <div
        style={{
          display: "inline-block",
        }}
        // to center the google auth component
      >
        {/* <GoogleAuth1 /> NOT WORKING*/}
        <GoogleAuth2 />
        {/* <GoogleAuth3 /> */}
      </div>
    </div>
  );
}

export default Home;
