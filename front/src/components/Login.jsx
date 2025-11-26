import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg"
import google from "../assets/google.png"

function Login() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    axios
      .get("https://hewkad.com/auth/check", { withCredentials: true })
      .then((res) => {
        if (!mounted) return;
        if (res.data?.valid) {
          window.location.href = "/user/home";
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50">
          <img
            src={logo}
            alt="Logo"
            className="w-100 h-auto drop-shadow-xl"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl p-8 pt-20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-slate-600 text-sm mt-1">Sign in to continue</p>
          </div>

          {checking ? (
            <div className="w-full h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : (
            <a
              href="https://hewkad.com/auth/google"
              className="w-full h-12 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <img
                src={google}
                alt="Google"
                className="w-6 h-6"
              />
              <span className="font-semibold">Login with Google</span>
            </a>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our{" "}
              <span className="underline decoration-slate-300">Terms</span> and{" "}
              <span className="underline decoration-slate-300">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
