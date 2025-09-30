import React from "react";
import RequestVerification from "../components/auth/RequestVerification";

const Home = () => {
  return (
    <>
      <h1>Home Page - Protected</h1>

      <RequestVerification />

      <div className="mt-6">
        <p>Welcome to the protected Home page!</p>
        <p>This page is only accessible to authenticated users.</p>
      </div>
    </>
  );
};

export default Home;
