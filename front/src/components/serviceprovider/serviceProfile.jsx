import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, LogOut, Edit3, Save, X, Upload, Check, User, Phone, Mail, MapPin, CreditCard, FileText, RefreshCw } from "lucide-react";
import Navbar from "./components/navbar";
import "../../components/User/DaisyUI.css";

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000";

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
  });
  const [editUser, setEditUser] = useState(user);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [identityPreview, setIdentityPreview] = useState("");
  const [identityUploading, setIdentityUploading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        identityFile: d?.identityFile || "",
      };
      setUser(next);
      setEditUser(next);
    } catch {
      alert("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoaded(true);
    }
  }, [navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleEdit = () => setEditMode(true);
  const handleChange = (e) => setEditUser((p) => ({ ...p, [e.target.name]: e.target.value ?? "" }));
  const handleCancel = () => {
    setEditUser(user);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    if (identityPreview) URL.revokeObjectURL(identityPreview);
    setAvatarPreview("");
    setIdentityPreview("");
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    navigate("/", { replace: true });
  };

  const onUploadAvatar = useCallback(
    async (file) => {
      if (!file) return;
      try {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${API_BASE}/upload/avatar`, { method: "POST", credentials: "include", body: form });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Bad response ${res.status}: ${text.slice(0, 200)}`);
        }
        const data = await res.json();
        if (!res.ok || !data?.ok || !data?.url) throw new Error(data?.error || "Upload failed");
        setEditUser((p) => ({ ...p, picture: data.url }));
      } catch (err) {
        alert(err?.message || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
      }
    },
    [avatarPreview]
  );

  const uploadIdentity = async (file) => {
    if (!file) return;
    try {
      setIdentityUploading(true);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      const url = URL.createObjectURL(file);
      setIdentityPreview(url);

      const fd = new FormData();
      fd.append("identity", file);
      const res = await fetch(`${API_BASE}/profile/identity`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Upload failed");
      setUser((p) => ({ ...p, identityFile: data?.profile?.identityFile || data?.filePath || "" }));
      setEditUser((p) => ({ ...p, identityFile: data?.profile?.identityFile || data?.filePath || "" }));
    } catch (e) {
      alert(e?.message || "อัปโหลดรูปบัตรไม่สำเร็จ");
    } finally {
      setIdentityUploading(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        nickname: editUser.nickname || null,
        fullName: editUser.fullName || null,
        phone: editUser.phone || null,
        address: editUser.address || null,
        picture: editUser.picture || "",
        bank: editUser.bank || "",
        accountNumber: editUser.accountNumber || null,
        accountOwner: editUser.accountOwner || null,
        identityFile: editUser.identityFile || "",
      };
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Bad response ${res.status}: ${text.slice(0, 200)}`);
      }
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile");
      await loadProfile();
      setSaveSuccess(true);
      setTimeout(() => {
        setEditMode(false);
        setSaveSuccess(false);
      }, 1000);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
    } catch (err) { alert(err?.message || "บันทึกไม่สำเร็จ"); }
    finally { setIsSaving(false); }
  }, [editUser, loadProfile, avatarPreview, isSaving]);

  const switchPath = location.pathname.includes("/provider/profile") ? "/service/profile" : "/user/profile";

  const handleSwitchRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/customer/switch-role`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Switch role failed");
      const newRole = data.role_name;
      navigate(newRole === "service" ? "/service/profile" : "/user/profile", { replace: true });
    } catch {
      navigate(switchPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      {/* Header */}
      {/* Main content */}
      {/* ส่วนอื่นๆ เหมือนเดิม */}
      {/* ... */}

      {/* InfoField ปรับ Bank เป็น select */}
      {/** เปลี่ยนภายใน InfoField หรือส่ง props banks */}
    </div>
  );
}

// InfoField component
function InfoField({ icon, label, name, value, displayValue, editMode, onChange, readonly, multiline }) {
  const [banks, setBanks] = useState([]);

  // ถ้า label เป็น Bank Name ให้ fetch banks
  useEffect(() => {
    if (label === "Bank Name") {
      fetch(`${API_BASE}/customer/banks`, { credentials: "include" })
        .then(res => res.json())
        .then(setBanks)
        .catch(console.error);
    }
  }, [label]);

  if (label === "Bank Name" && editMode) {
    return (
      <div className="group">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</span>
          {label}
        </label>
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
        >
          <option value="">-- Select Bank --</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>{b.bank_name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="group">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</span>
        {label}
      </label>
      {editMode && !readonly ? (
        multiline ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
          />
        ) : (
          <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
          />
        )
      ) : (
        <div className={`px-4 py-3 rounded-xl ${readonly ? "bg-slate-50" : "bg-white/50"} border border-slate-200 text-slate-900`}>
          {displayValue || <span className="text-slate-400">Not provided</span>}
        </div>
      )}
    </div>
  );
}
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <Navbar />

    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <button
          onClick={handleSwitchRole}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Switch Role
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200">
            <img
              src={avatarPreview || resolveImg(user.picture)}
              alt="avatar"
              className="w-full h-full object-cover"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full cursor-pointer border border-slate-200">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && onUploadAvatar(e.target.files[0])}
                />
              </label>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">{user.nickname || "No nickname"}</div>
            <div className="text-sm text-slate-500">{user.email || "No email"}</div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4">
          <InfoField
            icon={<User size={16} />}
            label="Full Name"
            name="fullName"
            value={editUser.fullName}
            displayValue={user.fullName}
            editMode={editMode}
            onChange={handleChange}
          />
          <InfoField
            icon={<Phone size={16} />}
            label="Phone"
            name="phone"
            value={editUser.phone}
            displayValue={user.phone}
            editMode={editMode}
            onChange={handleChange}
          />
          <InfoField
            icon={<MapPin size={16} />}
            label="Address"
            name="address"
            value={editUser.address}
            displayValue={user.address}
            editMode={editMode}
            onChange={handleChange}
            multiline
          />
          <InfoField
            icon={<CreditCard size={16} />}
            label="Bank Name"
            name="bank"
            value={editUser.bank}
            displayValue={user.bank}
            editMode={editMode}
            onChange={handleChange}
          />
          <InfoField
            icon={<FileText size={16} />}
            label="Account Number"
            name="accountNumber"
            value={editUser.accountNumber}
            displayValue={user.accountNumber}
            editMode={editMode}
            onChange={handleChange}
          />
          <InfoField
            icon={<User size={16} />}
            label="Account Owner"
            name="accountOwner"
            value={editUser.accountOwner}
            displayValue={user.accountOwner}
            editMode={editMode}
            onChange={handleChange}
          />
        </div>

        {/* Identity Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <FileText size={16} />
            Identity Document
          </label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 border rounded-xl overflow-hidden">
              <img
                src={identityPreview || resolveImg(user.identityFile)}
                alt="identity"
                className="w-full h-full object-cover"
              />
            </div>
            {editMode && (
              <label className="cursor-pointer px-3 py-2 bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1">
                <Upload size={16} />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && uploadIdentity(e.target.files[0])}
                />
              </label>
            )}
            {identityUploading && <RefreshCw className="animate-spin" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 justify-end mt-6">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                <X className="inline mr-1" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                disabled={isSaving}
              >
                {saveSuccess ? <Check className="inline mr-1" /> : <Save className="inline mr-1" />}
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              <Edit3 className="inline mr-1" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
