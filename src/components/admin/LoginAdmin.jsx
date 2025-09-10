import React from 'react'
import { Link } from 'react-router-dom'

function LoginAdmin() {
  return (
    <div className="set-center min-h-screen bg-white">
      <div id="container mx-auto">
        <div className="login-con relative h-85 w-164 rounded-4xl bg-[#D9D9D9] shadow-xl set-center">
          <img src="/src/assets/logo.svg" alt="" className='absolute left-1/2 -translate-x-1/2 -top-30 w-104 h-50'/>
          <div className="input-con set-center flex-col mt-10">
            <p className='font-bold text-2xl mb-4'>LOGIN ADMIN</p>
          <input type="text" placeholder='username' className='bg-white h-10 w-70 p-4 text-xl text-[#7f7a7a] rounded-2xl'/>
          <input type="password" placeholder='password' className='bg-white h-10 w-70 p-4 mt-4 text-xl text-[#7f7a7a] rounded-2xl'/>
          <div className="btn-con set-center gap-12 mt-4">
          <Link to="/" className="px-8 py-2 bg-[#cabbbb] text-[#685a5a] rounded-full shadow-xl set-center gap-4 cursor-pointer">
            <p className='font-bold'>Cancel</p>
          </Link>
          <Link to="/Dashboard" className="px-8 py-2 bg-[#0e240d] text-white rounded-full shadow-xl set-center gap-4 cursor-pointer">
            <p className='font-bold'>Login</p>
          </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginAdmin