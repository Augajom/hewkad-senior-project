import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  LogOut,
  Edit3,
  Save,
  X,
  Upload,
  Check,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  RefreshCw,
} from "lucide-react";
import Navbar from "./components/navbar";
import "../../components/User/DaisyUI.css";
import Swal from "sweetalert2";

const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) || "https://hewkad.com";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
}

export default function ServiceProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  // โหลดธนาคาร
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch(`${API_BASE}/customer/banks`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load banks");
        const data = await res.json();
        setBanks(data); // array {id, bank_name}
      } catch (err) {
        console.error("Error loading banks:", err);
      }
    };
    fetchBanks();
  }, []);

  // cleanup preview URLs
  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
    },
    [avatarPreview, identityPreview]
  );

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = () => setEditMode(true);
  const handleChange = (e) =>
    setEditUser((p) => ({ ...p, [e.target.name]: e.target.value ?? "" }));
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
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    navigate("/", { replace: true });
  };

  const onUploadAvatar = useCallback(
    async (file) => {
      if (!file) return;
      try {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${API_BASE}/upload/avatar`, {
          method: "POST",
          credentials: "include",
          body: form,
        });
        const data = await res.json();
        if (!res.ok || !data?.ok || !data?.url)
          throw new Error("Upload failed");
        setEditUser((p) => ({ ...p, picture: data.url }));
      } catch (err) {
        alert(err.message || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
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
      fd.append("identity", file, file.name || "identity.jpg");
      const res = await fetch(`${API_BASE}/profile/identity`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok)
        throw new Error(data?.error || "Upload identity failed");
      const savedPath = data?.profile?.identityFile || data?.filePath || "";
      setUser((p) => ({ ...p, identityFile: savedPath }));
      setEditUser((p) => ({ ...p, identityFile: savedPath }));
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
      if (!res.ok || !data?.ok)
        throw new Error(data?.error || "Failed to save profile");
      await loadProfile();
      setSaveSuccess(true);
      setTimeout(() => {
        setEditMode(false);
        setSaveSuccess(false);
      }, 1000);
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
        const res = await fetch(`${API_BASE}/customer/check-role`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
  
        if (data.hasServiceRole) {
          window.location.href = "/user/profile";
        } else {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            html: 'You do not have permission to access<br>the Customer role.',
            confirmButtonColor: "#3B82F6",
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not verify your roles. Please try again later.",
        });
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Profile
                </h1>
                <p className="text-xs text-slate-500">Manage your account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchRole}
                className="sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8 sticky top-24">
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-500/40">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {(
                        editMode
                          ? avatarPreview || editUser.picture || user.picture
                          : user.picture
                      ) ? (
                        <img
                          src={
                            editMode
                              ? avatarPreview ||
                                resolveImg(editUser.picture || user.picture)
                              : resolveImg(user.picture)
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <User className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  {editMode && (
                    <label
                      htmlFor="profileUpload"
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </label>
                  )}
                  <input
                    type="file"
                    id="profileUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      onUploadAvatar(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 text-center">
                  {user.fullName || "No Name"}
                </h2>
                <p className="text-slate-500 text-sm mb-6 text-center">
                  {user.email || "No Email"}
                </p>

                {!editMode ? (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="w-full space-y-2">
                    <button
                      onClick={handleSave}
                      disabled={!loaded || isSaving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h3>
              </div>

              <div className="space-y-6">
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
                  onChange={handleChange}
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
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Payment Information
                </h3>
              </div>

              <div className="space-y-6">
                <InfoField
                  icon={<CreditCard className="w-5 h-5" />}
                  label="Bank Name"
                  name="bank"
                  value={editUser.bank}
                  displayValue={user.bank}
                  editMode={editMode}
                  onChange={handleChange}
                  options={banks}
                />
                <InfoField
                  icon={<CreditCard className="w-5 h-5" />}
                  label="Account Number"
                  name="accountNumber"
                  value={editUser.accountNumber}
                  displayValue={user.accountNumber}
                  editMode={editMode}
                  onChange={handleChange}
                />
                <InfoField
                  icon={<User className="w-5 h-5" />}
                  label="Account Owner"
                  name="accountOwner"
                  value={editUser.accountOwner}
                  displayValue={user.accountOwner}
                  editMode={editMode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Identification Document
                </h3>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <label className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors cursor-pointer group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-slate-600 group-hover:text-blue-500 font-medium transition-colors">
                      Upload Document
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        uploadIdentity(f);
                      }}
                    />
                  </label>
                  {identityUploading && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                  {(identityPreview || user.identityFile) && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200">
                      <img
                        src={identityPreview || resolveImg(user.identityFile)}
                        alt="identity"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : user.identityFile ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={resolveImg(user.identityFile)}
                    alt="identification"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No document uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">
              Confirm Logout
            </h3>
            <p className="text-center text-slate-600 mb-8">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({
  icon,
  label,
  name,
  value,
  displayValue,
  editMode,
  onChange,
  readonly,
  multiline,
  options,
}) {
  return (
    <div className="group">
      <label className=" flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
          {icon}
        </span>
        {label}
      </label>

      {editMode && !readonly ? (
        options ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            className=" text-black w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
          >
            <option value="">-- Select {label} --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.bank_name}>
                {opt.bank_name}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            rows={3}
            className=" text-black  w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
          />
        ) : (
          <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            className=" text-black w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-white/50"
          />
        )
      ) : (
        <div
          className={`px-4 py-3 rounded-xl ${
            readonly ? "bg-slate-50" : "bg-white/50"
          } border border-slate-200 text-slate-900`}
        >
          {displayValue || <span className="text-slate-400">Not provided</span>}
        </div>
      )}
    </div>
  );
}
