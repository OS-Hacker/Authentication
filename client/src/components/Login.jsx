import React, { useState } from "react";
import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "./Signup"; // Reusing the same baseUrl

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Login successful - store token and redirect
      localStorage.setItem("authToken", data.token);
      navigate("/Home"); // Redirect to dashboard or home page
    } catch (error) {
      setErrors({ server: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Login</Title>

        {errors.server && <ErrorMessage>{errors.server}</ErrorMessage>}

        {location.state?.registrationSuccess && (
          <SuccessMessage>
            Registration successful! Please login.
          </SuccessMessage>
        )}

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
            $hasError={!!errors.email}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
            $hasError={!!errors.password}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </SubmitButton>

        <SignupLink>
          Don't have an account?{" "}
          <SignupAnchor href="/signup">Sign up</SignupAnchor>
        </SignupLink>

        <ForgotPasswordLink href="/forgot-password">
          Forgot password?
        </ForgotPasswordLink>
      </Form>
    </FormContainer>
  );
};

// Styled Components (reusing many from Signup with some additions)
const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 93vh;
  background-color: #121212;
`;

const Form = styled.form`
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  color: #ff9800;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: #e0e0e0;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${(props) => (props.$hasError ? "#ff4d4f" : "#333")};
  background: #2d2d2d;
  color: #fff;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#ff4d4f" : "#ff9800")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(255, 77, 79, 0.1)" : "rgba(255, 152, 0, 0.1)"};
  }

  &:disabled {
    background: #3d3d3d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #888;
  }
`;

const ErrorText = styled.span`
  color: #ff4d4f;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: block;
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #ff8c00;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #ffb74d;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #aaa;
  font-size: 0.95rem;
`;

const SignupAnchor = styled.a`
  color: #ff9800;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPasswordLink = styled.a`
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #aaa;
  font-size: 0.9rem;
  text-decoration: none;

  &:hover {
    color: #ff9800;
    text-decoration: underline;
  }
`;

export default Login;
