import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, LogOut, Edit3, Save, X, Upload, Check, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import Navbar from "./components/navbar";
import "../../components/User/DaisyUI.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
}

export default function ServiceProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [identityPreview, setIdentityPreview] = useState("");
  const [identityUploading, setIdentityUploading] = useState(false);

  const [user, setUser] = useState({
    picture: "", nickname: "", fullName: "", email: "", phone: "", address: "",
    bank: "", accountNumber: "", accountOwner: "", identityFile: "",
  });
  const [editUser, setEditUser] = useState(user);
  const [banks, setBanks] = useState([]);

  // โหลดธนาคาร
  useEffect(() => {
    fetch(`${API_BASE}/customer/banks`, { credentials: "include" })
      .then(res => res.json())
      .then(setBanks)
      .catch(console.error);
  }, []);

  // cleanup preview URLs
  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    if (identityPreview) URL.revokeObjectURL(identityPreview);
  }, [avatarPreview, identityPreview]);

  const loadProfile = useCallback(async () => {
    setLoaded(false);
    try {
      const res = await fetch(`${API_BASE}/profile?t=${Date.now()}`, { credentials: "include" });
      if (res.status === 401) return navigate("/", { replace: true });
      const data = await res.json();
      const next = {
        picture: data?.picture ?? "",
        nickname: data?.nickname ?? "",
        fullName: data?.fullName || data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        address: data?.address || "",
        bank: data?.bank || "",
        accountNumber: data?.accountNumber || "",
        accountOwner: data?.accountOwner || "",
        identityFile: data?.identityFile || "",
      };
      setUser(next); setEditUser(next);
    } catch { alert("โหลดโปรไฟล์ไม่สำเร็จ"); }
    finally { setLoaded(true); }
  }, [navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleChange = (e) => setEditUser(p => ({ ...p, [e.target.name]: e.target.value || "" }));
  const handleCancel = () => {
    setEditUser(user); setEditMode(false);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    if (identityPreview) URL.revokeObjectURL(identityPreview);
    setAvatarPreview(""); setIdentityPreview("");
  };

  const onUploadAvatar = useCallback(async (file) => {
    if (!file) return;
    try {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(file));
      const form = new FormData(); form.append("file", file);
      const res = await fetch(`${API_BASE}/upload/avatar`, { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.url) throw new Error("Upload failed");
      setEditUser(p => ({ ...p, picture: data.url }));
    } catch (err) { alert(err.message || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ"); }
  }, [avatarPreview]);

  const uploadIdentity = async (file) => {
    if (!file) return;
    try {
      setIdentityUploading(true);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      setIdentityPreview(URL.createObjectURL(file));
      const fd = new FormData(); fd.append("identity", file, file.name || "identity.jpg");
      const res = await fetch(`${API_BASE}/profile/identity`, { method: "PUT", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Upload identity failed");
      const savedPath = data?.profile?.identityFile || data?.filePath || "";
      setUser(p => ({ ...p, identityFile: savedPath }));
      setEditUser(p => ({ ...p, identityFile: savedPath }));
    } catch (e) { alert(e?.message || "อัปโหลดรูปบัตรไม่สำเร็จ"); }
    finally { setIdentityUploading(false); }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true); setSaveSuccess(false);
    try {
      const payload = { ...editUser };
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile");
      await loadProfile();
      setSaveSuccess(true);
      setTimeout(() => { setEditMode(false); setSaveSuccess(false); }, 1000);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
    } catch (err) { alert(err?.message || "บันทึกไม่สำเร็จ"); }
    finally { setIsSaving(false); }
  }, [editUser, loadProfile, avatarPreview, isSaving]);

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/", { replace: true });
  };

  const handleSwitchRole = () => navigate("/user/profile", { replace: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:gap-8 lg:gap-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/3">
            <div className="avatar relative mb-4">
              <div className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center">
                {(editMode ? avatarPreview || editUser.picture || user.picture : user.picture) && (
                  <img src={resolveImg(editMode ? avatarPreview || editUser.picture : user.picture)} alt="avatar" className="w-full h-full object-cover" />
                )}
                {editMode && (
                  <>
                    <label htmlFor="profileUpload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full">
                      <Camera className="w-8 h-8 text-white" />
                    </label>
                    <input type="file" id="profileUpload" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadAvatar(e.target.files[0])} />
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 text-center">{user.fullName || "No Name"}</h2>
              <p className="text-slate-500 text-sm mb-6 text-center">{user.email || "No Email"}</p>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:scale-105 transition-all duration-300">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="w-full space-y-2">
                  <button onClick={handleSave} disabled={!loaded || isSaving} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg disabled:opacity-50">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                  </button>
                  <button onClick={handleCancel} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all duration-300">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Personal & Payment Info */}
          <div className="flex-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
              </div>
              <div className="space-y-6">
                <InfoField icon={<User />} label="Nickname" name="nickname" value={editUser.nickname} displayValue={user.nickname} editMode={editMode} onChange={handleChange} />
                <InfoField icon={<User />} label="Full Name" name="fullName" value={editUser.fullName} displayValue={user.fullName} editMode={editMode} onChange={handleChange} />
                <InfoField icon={<Phone />} label="Phone Number" name="phone" value={editUser.phone} displayValue={user.phone} editMode={editMode} onChange={handleChange} />
                <InfoField icon={<Mail />} label="Email Address" name="email" value={user.email} displayValue={user.email} editMode={false} readonly />
                <InfoField icon={<MapPin />} label="Address" name="address" value={editUser.address} displayValue={user.address} editMode={editMode} onChange={handleChange} multiline />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Payment Information</h3>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <label>Bank:</label>
                  <div className="sm:col-span-2">
                    {editMode ? (
                      <select name="bank" value={editUser.bank} onChange={handleChange} className="input input-bordered w-full">
                        <option value="">-- Select Bank --</option>
                        {banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
                      </select>
                    ) : <div>{user.bank || "-"}</div>}
                  </div>
                </div>
                <InfoField label="Account Number" name="accountNumber" value={editUser.accountNumber} displayValue={user.accountNumber} editMode={editMode} onChange={handleChange} />
                <InfoField label="Account Owner" name="accountOwner" value={editUser.accountOwner} displayValue={user.accountOwner} editMode={editMode} onChange={handleChange} />

                {editMode ? (
                  <label className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed cursor-pointer">
                    <Upload className="w-5 h-5" /> Upload Document
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadIdentity(e.target.files[0])} />
                  </label>
                ) : user.identityFile ? (
                  <img src={resolveImg(user.identityFile)} alt="identity" className="w-full h-auto mt-2 rounded-xl border" />
                ) : <div className="text-center py-8 text-slate-400">No document uploaded</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon, label, name, value, displayValue, editMode, onChange, readonly, multiline }) {
  return (
    <div className="group">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">{icon && <span>{icon}</span>}{label}</label>
      {editMode && !readonly ? (
        multiline ? <textarea name={name} value={value || ""} onChange={onChange} className="w-full px-4 py-3 rounded-xl border" rows={3} /> :
          <input type="text" name={name} value={value || ""} onChange={onChange} className="w-full px-4 py-3 rounded-xl border" />
      ) : (
        <div className={`px-4 py-3 rounded-xl ${readonly ? "bg-slate-50" : "bg-white/50"} border`}>{displayValue || <span className="text-slate-400">Not provided</span>}</div>
      )}
    </div>
  );
}
