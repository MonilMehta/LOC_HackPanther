import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, Key, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { loginCitizen } from '../../apis/citizen.api';
import axios from "axios";

const Login = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isPhone = (input) => /^[6-9]\d{9}$/.test(input);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail(identifier)
        ? { email: identifier, password }
        : isPhone(identifier)
        ? { phoneNo: identifier, password }
        : null;

      if (!payload) {
        setError("Please enter a valid email or phone number");
        setLoading(false);
        return;
      }

      const response = await axios.post(loginCitizen, payload);
      if (response.data.success) {
        console.log(response);
        const token = response.data.data.accessToken;
        login(token, "Citizen");
        document.cookie = `accessToken=${token};max-age=${7 * 24 * 60 * 60};path=/`;
        document.cookie = `role=citizen;max-age=${7 * 24 * 60 * 60};path=/`;
        navigate("/report")
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.split("Error: ")[1].split("<br>")[0] || "An error occurred. Please try again.");
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      <div className="w-full max-w-md p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 rounded-2xl bg-gradient-to-tr from-teal-400/20 to-blue-500/20 backdrop-blur-xl mb-4">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            SurakshaSetu
          </h1>
          <p className="text-slate-400 mt-2">Connecting Communities, Ensuring Safety</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="space-y-6 backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10"
        >
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email or Phone</label>
            <div className="relative">
              {identifier.includes('@') ? (
                <Mail className="absolute left-2 top-2 h-5 w-5 text-slate-400" />
              ) : (
                <Phone className="absolute left-2 top-2 h-5 w-5 text-slate-400" />
              )}
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="Enter email or phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Password</label>
            <div className="relative">
              <Key className="absolute left-2 top-2 h-5 w-5 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </motion.form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <a href="/signup" className="text-teal-400 hover:text-teal-300">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
