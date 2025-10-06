import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";
import { publicApi } from "../../services/Api";

const VerifyAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying..."); // loading, success, error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5); // seconds

  // Email verification request effect
useEffect(() => {
  const verify = async () => {
    if (!token) return;

    try {
      const { data } = await publicApi.get(`auth/verify-email/${token}`);
      setStatus("success");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Verification failed or link expired."
      );
    }
  };

  verify();
}, [token]);


  // Countdown timer for success redirect
  useEffect(() => {
    if (status !== "success") return;

    setCountdown(5); // reset
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center p-6 pb-8">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-700 font-medium">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center p-6 pb-8 bg-green-50 rounded">
            <CheckCircle className="text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-semibold text-green-700 mb-2">
              Email Verified!
            </h2>
            <p className="text-green-800 mb-4 font-medium">{message}</p>
            <p className="text-green-700 mb-2">
              Redirecting to login in {countdown} second
              {countdown !== 1 ? "s" : ""}...
            </p>
            <p className="text-sm text-green-500 mt-2">
              If you are not redirected,{" "}
              <Link to="/login" className="text-blue-500 underline">
                click here
              </Link>
              .
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center p-6 pb-8 bg-red-50 rounded">
            <XCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-semibold text-red-700 mb-2">
              Verification Failed
            </h2>
            <p className="text-red-800 mb-4 font-medium">{message}</p>
            <Link
              to="/signup"
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
            >
              <MailCheck className="mr-2" size={16} />
              Resend Verification Email
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
