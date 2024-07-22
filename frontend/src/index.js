import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId="55740038008-pthqt4vsjpe1mmjng0v9f3ek7nbtdjl1.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
