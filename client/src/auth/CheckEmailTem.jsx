import React from "react";
import { MailCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function obfuscateEmail(email) {
  if (!email) return "your email";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.max(1, Math.floor(local.length / 2)));
  return `${visible}...@${domain}`;
}

const CheckEmailTem = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <MailCheck className="mx-auto text-blue-500 mb-6" size={56} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-4">
          We sent a verification link to{" "}
          <strong>{obfuscateEmail(email)}</strong>.
          <br />
          Please check your inbox and click the link to verify your account.
        </p>

        <p className="text-sm text-gray-400 mb-6">
          Didn’t receive the email? Check your spam folder or&nbsp;
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-blue-600 underline"
          >
            resend verification
          </button>
          .
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailTem;
