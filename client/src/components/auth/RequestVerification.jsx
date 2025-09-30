import React, { useState } from "react";
import apiClient from "../../services/Api";

const RequestVerification = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/verify-email", { email });
      setMessage(res.data.message || "Verification email sent!");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to send verification email."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Verification Email</button>
      <div>{message}</div>
    </form>
  );
};

export default RequestVerification;
