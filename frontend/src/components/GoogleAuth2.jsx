import React, { useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleAuth2 = () => {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  const apiGoogleAuth = async (user) => {
    if (user && user.access_token) {
      await axios
        .post("/auth/google-auth2", {
          access_token: user.access_token,
        })
        .then((res)=>{
          console.log(res);
          navigate("/chat")
        })
        .catch((error)=>{
          console.log(error);
        });

        // axios
        // .get(
        //   `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${user.access_token}`,
        //       Accept: "application/json",
        //     },
        //   }
        // )
        // .then((res) => {
        //   setProfile(res.data);
        // })
        // .catch((err) => console.log(err));
    }
  }

  useEffect(() => {
    apiGoogleAuth(user)
  }, [user]);


  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  return (
    <div>
      <h2>React Google Login</h2>
      <br />
      <br />
      {profile ? (
        <div>
          <img src={profile.picture} alt="user image" />
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email Address: {profile.email}</p>
          <br />
          <br />
          <button onClick={logOut}>Log out</button>
        </div>
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </div>
  );
};

export { GoogleAuth2 };
