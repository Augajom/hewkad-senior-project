import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [identityFileName, setIdentityFileName] = useState("");
  const [identityUploading, setIdentityUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
    };
  }, [avatarPreview, identityPreview]);

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
      setIdentityFileName("");
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

  async function uploadIdentity(file) {
    if (!file) return;
    try {
      setIdentityUploading(true);
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      const url = URL.createObjectURL(file);
      setIdentityPreview(url);
      setIdentityFileName(file.name);

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
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json"))
        throw new Error("Bad response from server");
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
        picture: editUser.picture || "", // ใช้ URL ที่ได้จากอัปโหลด avatar
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

      // รีโหลดโปรไฟล์ + ปิดโหมดแก้ไข
      await loadProfile();
      setEditMode(false);

      // เคลียร์พรีวิวชั่วคราว
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
      localStorage.setItem("role", newRole);
      const switchPath =
        newRole === "service" ? "/service/profile" : "/user/profile";
      navigate(switchPath, { replace: true });
    } catch (err) {
      console.error("Switch role failed:", err);
      alert("ไม่สามารถเปลี่ยน role ได้");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:gap-8 lg:gap-12">
          {/* === Avatar Section === */}
          <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/3">
            <div className="avatar relative mb-4">
              <div className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center">
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
                ) : null}

                {editMode && (
                  <label
                    htmlFor="profileUpload"
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full"
                    title="Upload new avatar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 sm:h-10 sm:w-10 text-white"
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

            {!editMode && (
              <button
                onClick={handleEdit}
                className="btn btn-link mt-2 text-primary no-underline"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* === Profile Form === */}
          <div className="flex-1 md:w-2/3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loaded || isSaving) return;
                handleSave();
              }}
              className="w-full"
            >
              <div className="space-y-6">
                {[
                  {
                    label: "Nickname :",
                    name: "nickname",
                    value: editUser.nickname,
                  },
                  {
                    label: "Name-Surname :",
                    name: "fullName",
                    value: editUser.fullName,
                  },
                  { label: "Phone :", name: "phone", value: editUser.phone },
                  {
                    label: "Address :",
                    name: "address",
                    value: editUser.address,
                  },
                ].map((f) => (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                    key={f.name}
                  >
                    <label className="text-black text-sm sm:text-base font-medium">
                      {f.label}
                    </label>
                    <div className="sm:col-span-2">
                      {editMode ? (
                        <input
                          name={f.name}
                          value={f.value || ""}
                          onChange={handleChange}
                          className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                        />
                      ) : (
                        <div className="text-black break-words">
                          {user[f.name] || ""}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center mt-6">
                <label className="text-black text-sm sm:text-base font-medium">
                  Email :
                </label>
                <div className="text-black sm:col-span-2 break-words">
                  {user.email}
                </div>
              </div>

              <div className="mt-8 mb-6 text-black text-center sm:text-left font-semibold text-lg">
                Payment Information
              </div>

              <div className="space-y-6">
                {[
                  { label: "Bank :", name: "bank", value: editUser.bank },
                  {
                    label: "Account Number :",
                    name: "accountNumber",
                    value: editUser.accountNumber,
                  },
                  {
                    label: "Account Owner :",
                    name: "accountOwner",
                    value: editUser.accountOwner,
                  },
                ].map((f) => (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                    key={f.name}
                  >
                    <label className="text-black text-sm sm:text-base font-medium">
                      {f.label}
                    </label>
                    <div className="sm:col-span-2">
                      {editMode ? (
                        <input
                          name={f.name}
                          value={f.value || ""}
                          onChange={handleChange}
                          className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                        />
                      ) : (
                        <div className="text-black break-words">
                          {user[f.name] || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start mt-6">
                <label className="text-black text-sm sm:text-base font-medium sm:col-span-1 flex items-center">
                  Identification
                </label>
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
                      {identityUploading && (
                        <div className="text-xs text-gray-500">
                          Uploading...
                        </div>
                      )}
                      {identityPreview || user.identityFile ? (
                        <img
                          src={identityPreview || resolveImg(user.identityFile)}
                          alt="identity"
                          className="w-full max-h-64 object-contain border border-gray-200 rounded-md"
                        />
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No identification image
                        </div>
                      )}
                    </>
                  ) : user.identityFile ? (
                    <img
                      src={resolveImg(user.identityFile)}
                      alt="identification"
                      className="w-full max-w-52 max-h-52 object-contain border border-gray-200 rounded-md"
                    />
                  ) : (
                    <div className="text-black break-words">-</div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end mt-8">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-neutral w-full sm:w-auto"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success w-full sm:w-auto"
                      disabled={!loaded || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => handleSwitchRole()}
                      className="btn bg-green-500 hover:bg-green-600 text-black font-semibold w-full sm:w-auto"
                    >
                      Switch/Role
                    </button>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="btn bg-red-500 hover:bg-red-600 text-black font-semibold w-full sm:w-auto"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white p-6 rounded-lg shadow-xl text-black max-w-sm mx-auto">
            <h3 className="font-bold text-lg text-center mb-4">
              Confirm Logout
            </h3>
            <p className="text-center mb-6">You sure to logout?</p>
            <div className="modal-action flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="btn btn-ghost w-full sm:w-auto px-8 text-red-500 bg-white"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success w-full sm:w-auto px-8 text-black"
                onClick={handleLogout}
              >
                Confirm
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
