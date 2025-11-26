import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock } from 'react-icons/fi';

function LoginAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔐 ยิง API ไป backend (Logic เดิม)
      const res = await axios.post(
        'https://hewkad.com:8443/login',
        form,
        {
          withCredentials: true,
        }
      );

      // ✅ Login สำเร็จ (Logic เดิม)
      await Swal.fire({
        icon: 'success',
        title: 'Login Success',
        text: `Welcome ${res.data.user.username}!`,
        showConfirmButton: false,
        timer: 1500,
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-lg',
        },
      });

      navigate('/Dashboard');

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Invalid username or password',
        confirmButtonColor: '#d33',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-lg',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative">
        
        <img
          src="../../assets/logo.svg"
          alt="logo"
          className="absolute left-1/2 -translate-x-1/2 -top-20 w-40 z-10"
        />
        <div className="login-con w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8">
          
          <form
            onSubmit={handleSubmit}
            className="input-con flex flex-col items-center"
          >
            <p className="font-bold text-3xl mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              LOGIN ADMIN
            </p>

            <div className="relative w-full mb-4">
              <FiUser className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                required
              />
            </div>

            <div className="relative w-full mb-6">
              <FiLock className="absolute size-5 left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full rounded-xl border-slate-300 bg-white/50 pl-12 text-slate-900 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                required
              />
            </div>
            
            <div className="btn-con flex w-full gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn flex-1 border-none text-white font-medium shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;