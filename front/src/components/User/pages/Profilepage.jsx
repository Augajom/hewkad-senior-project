import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  LogOut,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import Navbar from "../components/navbar";

const API_BASE = "http://localhost:5000";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
}

export default function ProfilePage() {
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
  });
  const [editUser, setEditUser] = useState(user);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [identityPreview, setIdentityPreview] = useState("");
  const [identityUploading, setIdentityUploading] = useState(false);

  const [banks, setBanks] = useState([]);

  // Load bank list
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch(`${API_BASE}/customer/banks`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load banks");
        const data = await res.json();
        setBanks(data);
      } catch (err) {
        console.error("Error loading banks:", err);
      }
    };
    fetchBanks();
  }, []);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
    };
  }, [avatarPreview, identityPreview]);

  // Load profile
  const loadProfile = useCallback(async () => {
    setLoaded(false);
    try {
      const res = await fetch(`${API_BASE}/profile?t=${Date.now()}`, {
        credentials: "include",
      });
      if (res.status === 401) return;
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
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = () => setEditMode(true);
  const handleChange = (e) =>
    setEditUser((p) => ({ ...p, [e.target.name]: e.target.value ?? "" }));
  const handleCancel = () => {
    setEditUser(user);
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    window.location.href = "/";
  };

  async function uploadIdentity(file) {
    if (!file) return;
    try {
      setIdentityUploading(true);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      const url = URL.createObjectURL(file);
      setIdentityPreview(url);

      const fd = new FormData();
      fd.append("identity", file, file.name || "identity.jpg");
      const res = await fetch(`${API_BASE}/profile/identity`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error("Upload identity failed");
      const savedPath = data?.profile?.identityFile || data?.filePath || "";
      setUser((p) => ({ ...p, identityFile: savedPath }));
      setEditUser((p) => ({ ...p, identityFile: savedPath }));
    } catch (e) {
      alert(e?.message || "อัปโหลดรูปบัตรไม่สำเร็จ");
    } finally {
      setIdentityUploading(false);
    }
  }

  const onUploadAvatar = async (file) => {
    if (!file) return;
    try {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/upload/avatar`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.url) throw new Error("Upload failed");
      setEditUser((p) => ({ ...p, picture: data.url }));
    } catch (err) {
      alert(err?.message || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
    }
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
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile");

      await loadProfile();
      setEditMode(false);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
    } catch (err) {
      alert(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }, [editUser, loadProfile, avatarPreview, isSaving]);

  const handleSwitchRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/customer/switch-role`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Switch role failed");
      const newRole = data.role_name;
      window.location.href = newRole === "service" ? "/service/profile" : "/user/profile";
    } catch {
      alert("ไม่สามารถเปลี่ยน role ได้");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:gap-8 lg:gap-12">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/3">
            <div className="avatar relative mb-4">
              <div className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center">
                <img
                  src={avatarPreview || resolveImg(editUser.picture) || resolveImg(user.picture)}
                  className="w-full h-full object-cover"
                />
                {editMode && (
                  <label
                    htmlFor="profileUpload"
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </label>
                )}
              </div>
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onUploadAvatar(file);
                  e.currentTarget.value = "";
                }}
              />
            </div>
            {!editMode && (
              <button onClick={handleEdit} className="btn btn-link mt-2 text-primary">
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div className="flex-1 md:w-2/3 space-y-6">
            <InfoField
              icon={<User className="w-5 h-5" />}
              label="Nickname"
              name="nickname"
              value={editUser.nickname}
              displayValue={user.nickname}
              editMode={editMode}
              onChange={handleChange}
            />
            <InfoField
              icon={<User className="w-5 h-5" />}
              label="Full Name"
              name="fullName"
              value={editUser.fullName}
              displayValue={user.fullName}
              editMode={editMode}
              onChange={handleChange}
            />
            <InfoField
              icon={<Phone className="w-5 h-5" />}
              label="Phone Number"
              name="phone"
              value={editUser.phone}
              displayValue={user.phone}
              editMode={editMode}
              onChange={handleChange}
            />
            <InfoField
              icon={<Mail className="w-5 h-5" />}
              label="Email Address"
              name="email"
              value={user.email}
              displayValue={user.email}
              editMode={false}
              readonly
            />
            <InfoField
              icon={<MapPin className="w-5 h-5" />}
              label="Address"
              name="address"
              value={editUser.address}
              displayValue={user.address}
              editMode={editMode}
              onChange={handleChange}
              multiline
            />

            {/* Payment Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Payment Information</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <label className="text-black text-sm sm:text-base font-medium">Bank:</label>
                  <div className="sm:col-span-2">
                    {editMode ? (
                      <select
                        name="bank"
                        value={editUser.bank || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                      >
                        <option value="">-- Select Bank --</option>
                        {banks.map((b) => (
                          <option key={b.id} value={b.id}>{b.bank_name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-black">{user.bank || "-"}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <label className="text-black text-sm sm:text-base font-medium">Account Number:</label>
                  <div className="sm:col-span-2">
                    {editMode ? (
                      <input
                        name="accountNumber"
                        value={editUser.accountNumber || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                      />
                    ) : (
                      <div className="text-black">{user.accountNumber || "-"}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <label className="text-black text-sm sm:text-base font-medium">Account Owner:</label>
                  <div className="sm:col-span-2">
                    {editMode ? (
                      <input
                        name="accountOwner"
                        value={editUser.accountOwner || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                      />
                    ) : (
                      <div className="text-black">{user.accountOwner || "-"}</div>
                    )}
                  </div>
                </div>

                {/* Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start mt-6">
                  <label className="text-black text-sm sm:text-base font-medium sm:col-span-1 flex items-center">Identification</label>
                  <div className="sm:col-span-2 space-y-2">
                    {editMode ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="file-input file-input-bordered w-full max-w-md bg-white text-black"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            uploadIdentity(f);
                          }}
                        />
                        {identityUploading && <div className="text-xs text-gray-500">Uploading...</div>}
                        {(identityPreview || user.identityFile) && (
                          <img
                            src={identityPreview || resolveImg(user.identityFile)}
                            alt="identity"
                            className="w-full max-h-64 object-contain border border-gray-200 rounded-md"
                          />
                        )}
                        {!identityPreview && !user.identityFile && (
                          <div className="text-gray-400 text-sm">No identification image</div>
                        )}
                      </>
                    ) : user.identityFile ? (
                      <img
                        src={resolveImg(user.identityFile)}
                        alt="identification"
                        className="w-full max-w-52 max-h-52 object-contain border border-gray-200 rounded-md"
                      />
                    ) : (
                      <div className="text-center py-8 text-slate-400">No document uploaded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Cancel */}
            {editMode && (
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={handleCancel} className="btn btn-outline w-full">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="btn btn-primary w-full">
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon, label, name, value, displayValue, editMode, onChange, readonly, multiline }) {
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
        <div className={`px-4 py-3 rounded-xl ${readonly ? 'bg-slate-50' : 'bg-white/50'} border border-slate-200 text-slate-900`}>
          {displayValue || <span className="text-slate-400">Not provided</span>}
        </div>
      )}
    </div>
  );
}
