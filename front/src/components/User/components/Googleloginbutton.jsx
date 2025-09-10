import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import '../DaisyUI.css'

export default function GoogleLoginButton() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (tokenResponse.access_token) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          });
          const user = await res.json();
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/profile', { replace: true }); // หน้า login จะถูกแทนที่
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
    flow: 'implicit', // หรือ 'auth-code' ตามที่ตั้งค่าไว้ใน Google Console
  });

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={() => login()}
        className="rounded-full bg-white shadow-md px-6 py-2 flex items-center gap-2 hover:bg-gray-100 transition duration-300 cursor-pointer text-black font-semibold"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-6 h-6"
        />
        เข้าสู่ระบบด้วย Google
      </button>
    </div>
  );
}