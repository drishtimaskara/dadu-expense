import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

const [step, setStep] = useState(1);
const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const sendOtp = async () => {
  try {
    await API.post("/auth/send-otp", {
      email: formData.email,
    });

    setStep(2);
    alert("OTP sent to email");
  } catch (err) {
  console.log("OTP ERROR FULL:", err);
  console.log("BACKEND RESPONSE:", err.response?.data);
  console.log("STATUS:", err.response?.status);

  alert(err.response?.data?.message || "Failed to send OTP");
}
  
};

const verifyAndRegister = async () => {
  try {
    await API.post("/auth/verify-otp", {
      email: formData.email,
      otp,
    });

    await API.post("/auth/register", formData);

    alert("Registration successful");

    navigate("/login");
  } catch (err) {
    alert("Invalid OTP or registration failed");
  }
};

  return (
    <div className="min-h-screen flex justify-center items-center">
    {step === 1 && (
  <form
    onSubmit={(e) => e.preventDefault()}
    className="w-96 p-6 shadow-lg rounded-lg"
  >
    <h1 className="text-3xl font-bold mb-4">Register</h1>

    <input
      type="text"
      name="name"
      placeholder="Name"
      value={formData.name}
      onChange={handleChange}
      className="border p-2 w-full mb-3"
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      className="border p-2 w-full mb-3"
    />

    <input
      type="password"
      name="password"
      placeholder="Create Password"
      value={formData.password}
      onChange={handleChange}
      className="border p-2 w-full mb-3"
    />

    <button
      type="button"
      onClick={sendOtp}
      className="bg-green-500 text-white p-2 w-full"
    >
      Send OTP
    </button>
  </form>
)}


{step === 2 && (
   <div className="w-96 p-6 shadow-lg rounded-lg">
    <h1 className="text-3xl font-bold mb-4">Verify OTP</h1>

    <input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className="border p-2 w-full mb-3"
    />

    <button
      onClick={verifyAndRegister}
      className="bg-blue-500 text-white p-2 w-full"
    >
      Verify & Register
    </button>
    </div>
    )}
  </div>

  );
}

export default Register;