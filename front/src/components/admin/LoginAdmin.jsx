import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

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
      // 🔐 ยิง API ไป backend
      const res = await axios.post(
        'http://localhost:5000/login',
        form,
        {
          withCredentials: true,
        }
      );

      // ✅ Login สำเร็จ
      await Swal.fire({
        icon: 'success',
        title: 'Login Success',
        text: `Welcome ${res.data.user.username}!`,
        showConfirmButton: false,
        timer: 1500,
      });

      navigate('/Dashboard');

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Invalid username or password',
        confirmButtonColor: '#0e240d',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-center min-h-screen bg-white">
      <div id="container mx-auto">
        <div className="login-con relative h-85 w-164 rounded-4xl bg-[#D9D9D9] shadow-xl set-center">
          <img
            src="/src/assets/logo.svg"
            alt="logo"
            className="absolute left-1/2 -translate-x-1/2 -top-30 w-104 h-50"
          />

          <form
            onSubmit={handleSubmit}
            className="input-con set-center flex-col mt-10"
          >
            <p className="font-bold text-2xl mb-4">LOGIN ADMIN</p>

            <input
              type="text"
              name="username"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              className="bg-white h-10 w-70 p-4 text-xl text-[#7f7a7a] rounded-2xl"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="password"
              value={form.password}
              onChange={handleChange}
              className="bg-white h-10 w-70 p-4 mt-4 text-xl text-[#7f7a7a] rounded-2xl"
              required
            />

            <div className="btn-con set-center gap-12 mt-4">
              <Link
                to="/"
                className="px-8 py-2 bg-[#cabbbb] text-[#685a5a] rounded-full shadow-xl set-center gap-4 cursor-pointer"
              >
                <p className="font-bold">Cancel</p>
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-[#0e240d] text-white rounded-full shadow-xl set-center gap-4 cursor-pointer disabled:opacity-60"
              >
                <p className="font-bold">{loading ? 'Loading...' : 'Login'}</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;
