import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

import Navbar from '../components/navbar';
import { Link } from 'react-router-dom'
import '../DaisyUI.css'

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ดึงข้อมูล user จาก localStorage (Google Login)
  const googleUser = JSON.parse(localStorage.getItem('user') || '{}');


  const [user, setUser] = useState({
    picture: googleUser.picture || googleUser.imageUrl || '',
    nickname: googleUser.given_name || '',
    fullName: googleUser.name || '',
    email: googleUser.email || '',
    phone: '',
    address: '',
    bank: '',
    accountNumber: '',
    accountOwner: '',
    identityFile: '',
    identityFileName: '', // ✅ เพิ่มบรรทัดนี้

  });

  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState(user);

  useEffect(() => {
    setUser((prev) => ({
      ...prev,
      picture: googleUser.picture || prev.picture,
      nickname: googleUser.given_name || prev.nickname,
      fullName: googleUser.name || prev.fullName,
      email: googleUser.email || prev.email,
    }));
    setEditUser((prev) => ({
      ...prev,
      picture: googleUser.picture || prev.picture,
      nickname: googleUser.given_name || prev.nickname,
      fullName: googleUser.name || prev.fullName,
      email: googleUser.email || prev.email,
    }));
    // eslint-disable-next-line
  }, []);

  const handleEdit = () => setEditMode(true);

  const handleSave = () => {
    setUser(editUser);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditUser(user);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleLogout = () => {
    localStorage.removeItem('user'); // ลบข้อมูล user ออกจาก localStorage
    navigate('/', { replace: true }); // กลับไปหน้า login
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}

      <Navbar />

      <div className="max-w-4xl  ml-100 mt-10 flex gap-60 items-start">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="avatar relative">
            <div className="w-48 h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center">
              <img
                src={editMode ? editUser.picture || user.picture : user.picture}
                alt="avatar"
                className="w-full h-full object-cover"
              />

              {/* ตอน Edit ให้โชว์ overlay icon กล้อง */}
              {editMode && (
                <label
                  htmlFor="profileUpload"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7h4l2-3h6l2 3h4v13H3V7z"
                    />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </label>
              )}
            </div>

            {/* hidden input file */}
            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setEditUser((prev) => ({
                      ...prev,
                      picture: reader.result, // preview image ใหม่
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          {!editMode && (
            <button
              onClick={handleEdit}
              className="btn btn-link mt-2 text-primary no-underline"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="space-y-4">
              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Nickname :</label>
                {editMode ? (
                  <input
                    name="nickname"
                    value={editUser.nickname}
                    onChange={handleChange}
                    className="input input-bordered w-full  bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.nickname}</div>
                )}
              </div>

              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Name-Surname :</label>
                {editMode ? (
                  <input
                    name="fullName"
                    value={editUser.fullName}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.fullName}</div>
                )}
              </div>


              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Phone :</label>
                {editMode ? (
                  <input
                    name="phone"
                    value={editUser.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.phone}</div>
                )}
              </div>

              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Address :</label>
                {editMode ? (
                  <input
                    name="address"
                    value={editUser.address}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.address}</div>
                )}
              </div>
              <div className='flex items-center'>
                <label className="text-black w-45 mr-2" >Email :</label>
                <div className='text-black'>{user.email}</div>

              </div>

            </div>
            <div className='space-y-1'>
              <div className="mt-8 text-black text-center font-semibold">Payment Information (Optional)</div>
              <div className="text-center text-xs text-gray-500 mb-4">
                A User Who Wants To Be A Service Provider Should Focus On Delivering Quality And Meeting Customer Needs
              </div>
            </div>


            <div className="space-y-4">
              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Bank :</label>
                {editMode ? (
                  <input
                    name="bank"
                    value={editUser.bank}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.bank}</div>
                )}
              </div>

              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Accout Number :</label>
                {editMode ? (
                  <input
                    name="accountNumber"
                    value={editUser.accountNumber}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.accountNumber}</div>
                )}
              </div>

              <div className='flex items-center'>
                <label className="text-black w-45 mr-2">Accout Owner :</label>
                {editMode ? (
                  <input
                    name="accountOwner"
                    value={editUser.accountOwner}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className='text-black'>{user.accountOwner}</div>
                )}
              </div>

              <div className="flex items-center">
                <label className="text-black w-45 mr-2">Identity File :</label>
                {editMode ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditUser((prev) => ({
                            ...prev,
                            identityFile: reader.result,
                            identityFileName: file.name, // ✅ เก็บชื่อไฟล์
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file-input file-input-bordered w-full max-w-xs bg-white text-black"
                  />
                ) : (
                  <div className="text-black">
                    {user.identityFileName ? user.identityFileName : "-"}
                  </div>
                )}
              </div>
            </div>



            {editMode && (
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-neutral"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Save
                </button>
              </div>
            )}

          </form>
          <button
            onClick={()=>setShowLogoutModal(true)}
            className="fixed bottom-6 right-6 bg-red-500 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-red-600 transition cursor-pointer"
          >
            Logout
          </button>
          {/* ✅ Modal ยืนยัน Logout (เหมือน confirm update modal) */}
          {showLogoutModal && (
            <dialog className="modal modal-open">
              <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
                <h3 className="font-bold text-lg text-center mb-4">Confirm Logout</h3>
                <p className="text-center mb-6">You sure to logout?</p>
                <div className="modal-action flex justify-center gap-4">
                  <button
                    className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white"
                    onClick={() => setShowLogoutModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success px-8 py-3 rounded-full text-black"
                    onClick={handleLogout}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
}