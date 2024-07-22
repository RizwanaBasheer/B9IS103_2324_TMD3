import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export const GoogleAuth3 = () => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log(credentialResponse);
        axios
          .post("/auth/google-auth", {
            clientId: credentialResponse.clientId,
            credential: credentialResponse.credential,
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
};
