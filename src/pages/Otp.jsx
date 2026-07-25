import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import BASE_URL from "../components/urls";

const schema = yup.object().shape({
  otp: yup
    .string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

const Otp = () => {
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
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const handleChange = (element, index) => {
    const value = element.value;
    if (!/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 5 && value !== "") {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    setValue("otp", newOtp.join(""));
  };

  const submitForm = (data) => {
    setLoading(true);
    axios
      .post(`${BASE_URL}/otp`, data)
      .then((response) => {
        console.log(response.data);
        setOtp(new Array(6).fill(""));
        reset();
        navigate("/otp");
      })
      .catch((error) => {
        console.error("Error verifying OTP", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-start py-56 min-h-screen px-6">
      <div className="max-w-md w-full ">
        <h2 className="text-2xl font-bold text-center mb-2">
          Enter your verification code
        </h2>
        <p className="text-gray-500 text-center mb-4">
          Enter the six-digit code (OTP) sent to your registered email 
          <span> {email}</span>
        </p>

        <form onSubmit={handleSubmit(submitForm)}>
          <div className="flex justify-center space-x-2 mb-8">
            {otp.map((data, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-12 border  border-gray-300 text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                inputMode="numeric"
              />
            ))}
          </div>

          {errors.otp && (
            <p className="text-red-500 text-sm text-center">
              {errors.otp.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-lg disabled:cursor-not-allowed"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Otp;
