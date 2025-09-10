import React from 'react'
import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="set-center min-h-screen bg-white">
      <div id="container mx-auto">
        <div className="login-con relative h-64 w-164 rounded-4xl bg-[#D9D9D9] shadow-xl set-center">
          <img src="/src/assets/logo.svg" alt="" className='absolute left-1/2 -translate-x-1/2 -top-30 w-104 h-50'/>
          <Link to="/Profile" className="h-20 w-80 bg-white mt-18 rounded-full shadow-xl set-center gap-4 cursor-pointer">
            <img src="/src/assets/google.png" alt="" className='size-12'/>
            <p className='font-bold text-black'>LOGIN WITH GOOGLE</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login