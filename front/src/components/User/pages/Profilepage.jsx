import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import "../DaisyUI.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [user, setUser] = useState({
    picture: "",
    nickname: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bank: "",
    accountNumber: "",
    accountOwner: "",
    identityFile: "",
    identityFileName: ""
  });
  const [editUser, setEditUser] = useState(user);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Load profile
  const loadProfile = useCallback(async () => {
    setLoaded(false);
    try {
      const res = await fetch(`${API_BASE}/profile?t=${Date.now()}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/", { replace: true });
        return;
      }
      if (!res.ok) throw new Error("Failed to load profile");
      const d = await res.json();
      const next = {
        picture: d?.picture ?? "",
        nickname: d?.nickname ?? "",
        fullName: d?.fullName || d?.name || "",
        email: d?.email || "",
        phone: d?.phone || "",
        address: d?.address || "",
        bank: d?.bank || "",
        accountNumber: d?.accountNumber || "",
        accountOwner: d?.accountOwner || "",
        identityFile: "",
        identityFileName: ""
      };
      setUser(next);
      setEditUser(next);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
    } catch (err) {
      alert("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoaded(true);
    }
  }, [navigate, avatarPreview]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = () => setEditMode(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((p) => ({ ...p, [name]: value ?? "" }));
  };

  const handleCancel = () => {
    setEditUser(user);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
    }
    setEditMode(false);
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        nickname: editUser.nickname || null,
        fullName: editUser.fullName || null,
        phone: editUser.phone || null,
        address: editUser.address || null,
        bank: editUser.bank || "",
        accountNumber: editUser.accountNumber || null,
        accountOwner: editUser.accountOwner || null
      };
      if (editUser.picture && String(editUser.picture).trim() !== "") {
        payload.picture = editUser.picture.split("?")[0];
      }
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile");
      await loadProfile();
      setEditMode(false);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
      alert("Profile saved.");
    } catch (err) {
      alert(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }, [editUser, loadProfile, avatarPreview, isSaving]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch { }
    navigate("/", { replace: true });
  };

  // Switch role
  const handleSwitchRole = async () => {
  try {
    const res = await fetch(`${API_BASE}/customer/switch-role`, {
      method: "POST",
      credentials: "include", // สำคัญ! เพื่อส่ง cookie
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Switch role failed");

    const newRole = data.role_name;
    localStorage.setItem("role", newRole);

    const switchPath = newRole === "service" ? "/service/profile" : "/user/profile";
    navigate(switchPath, { replace: true });
  } catch (err) {
    console.error("Switch role failed:", err);
    alert("ไม่สามารถเปลี่ยน role ได้");
  }
};

  const rawImg = editMode ? (avatarPreview || editUser.picture || user.picture) : user.picture;
  const currentImg = resolveImg(rawImg);
  const hasImg = Boolean(currentImg && currentImg.trim() !== "");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl ml-100 mt-10 flex gap-60 items-start">
        <div className="flex flex-col items-center">
          <div className="avatar relative">
            <div className="w-48 h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center bg-gray-100">
              {hasImg ? (
                <img key={currentImg} src={currentImg} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
          </div>
          {!editMode && (
            <button onClick={handleEdit} className="btn btn-link mt-2 text-primary no-underline">Edit Profile</button>
          )}
        </div>

        <div className="flex-1 mb-10">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="space-y-4">
              {["nickname", "fullName", "phone", "address"].map((field) => (
                <div className="flex items-center" key={field}>
                  <label className="text-black w-45 mr-2">{field}</label>
                  {editMode ? (
                    <input name={field} value={editUser[field] || ""} onChange={handleChange} className="input input-bordered w-full bg-white text-black border border-black" />
                  ) : (
                    <div className="text-black">{user[field]}</div>
                  )}
                </div>
              ))}

              <div className="flex items-center">
                <label className="text-black w-45 mr-2">Email :</label>
                <div className="text-black">{user.email}</div>
              </div>

              <div className="mt-8 text-black text-center font-semibold">Payment Information (Optional)</div>
              <div className="text-center text-xs text-gray-500 mb-4">
                A User Who Wants To Be A Service Provider Should Focus On Delivering Quality And Meeting Customer Needs
              </div>

              {["bank", "accountNumber", "accountOwner"].map((field) => (
                <div className="flex items-center" key={field}>
                  <label className="text-black w-45 mr-2">{field}</label>
                  {editMode ? (
                    <input name={field} value={editUser[field] || ""} onChange={handleChange} className="input input-bordered w-full bg-white text-black border border-black" />
                  ) : (
                    <div className="text-black">{user[field] || "-"}</div>
                  )}
                </div>
              ))}
            </div>
          </form>

          <button
            onClick={handleSwitchRole}
            className="fixed bottom-6 right-35 bg-green-500 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-green-600 transition cursor-pointer"
          >
            Switch Role
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="fixed bottom-6 right-6 bg-red-500 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-red-600 transition cursor-pointer"
          >
            Logout
          </button>

          {showLogoutModal && (
            <dialog className="modal modal-open">
              <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black">
                <h3 className="font-bold text-lg text-center mb-4">Confirm Logout</h3>
                <p className="text-center mb-6">You sure to logout?</p>
                <div className="modal-action flex justify-center gap-4">
                  <button className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                  <button className="btn btn-success px-8 py-3 rounded-full text-black" onClick={handleLogout}>Confirm</button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
}
