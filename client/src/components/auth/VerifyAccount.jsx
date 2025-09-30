import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../services/Api";

const VerifyAccount = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await apiClient.get(`/verify-email/${token}`);
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };
    verify();
  }, [token]);

  return <div>{message}</div>;
};

export default VerifyAccount;
