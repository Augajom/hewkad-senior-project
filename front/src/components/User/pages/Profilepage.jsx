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

      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
      if (identityPreview) { URL.revokeObjectURL(identityPreview); setIdentityPreview(""); }
      setIdentityFileName("");
    } catch {
      alert("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoaded(true);
    }
  }, [navigate, avatarPreview, identityPreview]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleEdit = () => setEditMode(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((p) => ({ ...p, [name]: value ?? "" }));
  };

  const handleCancel = () => {
    setEditUser(user);
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
    if (identityPreview) { URL.revokeObjectURL(identityPreview); setIdentityPreview(""); }
    setIdentityFileName("");
    setEditMode(false);
  };

  async function uploadIdentity(file) {
    if (!file) return;
    try {
      setIdentityUploading(true);

      // พรีวิว optimistic
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      const url = URL.createObjectURL(file);
      setIdentityPreview(url);
      setIdentityFileName(file.name);

      const fd = new FormData();
      fd.append("identity", file, file.name || "identity.jpg");

      const res = await fetch(`${API_BASE}/profile/identity`, {
        method: "PUT",
        credentials: "include",
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Upload identity failed");

      const savedPath = data?.profile?.identityFile || data?.filePath || "";
      setUser((prev) => ({ ...prev, identityFile: savedPath }));
      setEditUser((prev) => ({ ...prev, identityFile: savedPath }));
    } catch (e) {
      if (identityPreview) URL.revokeObjectURL(identityPreview);
      setIdentityPreview("");
      setIdentityFileName("");
      alert(e?.message || "อัปโหลดรูปบัตรไม่สำเร็จ");
    } finally {
      setIdentityUploading(false);
    }
  }

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
      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
      alert("Profile saved.");
    } catch (err) {
      alert(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }, [editUser, loadProfile, avatarPreview, isSaving]);

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/", { replace: true });
  };

  const handleSwitchRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/customer/switch-role`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Switch role failed");
      const newRole = data.role_name;
      localStorage.setItem("role", newRole);
      const switchPath = newRole === "service" ? "/provider/profile" : "/user/profile";
      navigate(switchPath, { replace: true });
    } catch (err) {
      console.error("Switch role failed:", err);
      alert("ไม่สามารถเปลี่ยน role ได้");
    }
  };

  const currentImg = resolveImg(editMode ? (avatarPreview || editUser.picture || user.picture) : user.picture);
  const hasImg = Boolean(currentImg && currentImg.trim() !== "");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <div className="avatar">
              <div className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-gray-100 flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48">
                {hasImg ? (
                  <img key={currentImg} src={currentImg} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
            </div>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn btn-link mt-3 text-primary no-underline">Edit Profile</button>
            )}
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                {["nickname", "fullName", "phone", "address"].map((field) => (
                  <div className="contents" key={field}>
                    <label className="text-black text-sm sm:text-base font-medium sm:col-span-1 flex items-center">{field}</label>
                    <div className="sm:col-span-2">
                      {editMode ? (
                        <input name={field} value={editUser[field] || ""} onChange={handleChange} className="input input-bordered w-full bg-white text-black border-black" />
                      ) : (
                        <div className="text-black break-words">{user[field]}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                <label className="text-black text-sm sm:text-base font-medium sm:col-span-1">Email :</label>
                <div className="text-black sm:col-span-2 break-words">{user.email}</div>
              </div>

              <div className="pt-2 text-black text-center sm:text-left font-semibold">Payment Information (Optional)</div>
              <div className="text-center sm:text-left text-xs text-gray-500 mb-2 sm:mb-4">
                A User Who Wants To Be A Service Provider Should Focus On Delivering Quality And Meeting Customer Needs
              </div>

              {/* Bank + Account */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                {["bank", "accountNumber", "accountOwner"].map((field) => (
                  <div className="contents" key={field}>
                    <label className="text-black text-sm sm:text-base font-medium sm:col-span-1 flex items-center">{field}</label>
                    <div className="sm:col-span-2">
                      {editMode ? (
                        <input name={field} value={editUser[field] || ""} onChange={handleChange} className="input input-bordered w-full bg-white border-black text-black" />
                      ) : (
                        <div className="text-black break-words">{user[field] || "-"}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Identify */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start" id="identity-section">
                <label className="text-black text-sm sm:text-base font-medium sm:col-span-1 flex items-center">
                  identification
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
                        <div className="text-xs text-gray-500">Uploading...</div>
                      )}

                      {(user.identityFile || identityPreview) && (
                        <div
                          className="text-xs text-gray-600 max-w-md truncate"
                          title={
                            identityPreview
                              ? identityFileName
                              : decodeURIComponent((user.identityFile || "").split("/").pop() || "")
                          }
                        >
                          <span className="font-medium">File: </span>
                          {identityPreview
                            ? identityFileName
                            : decodeURIComponent((user.identityFile || "").split("/").pop() || "-")}
                        </div>
                      )}

                      <div className="w-full max-w-md">
                        {(identityPreview || user.identityFile) ? (
                          <img
                            src={identityPreview || resolveImg(user.identityFile)}
                            alt="identity"
                            className="w-full max-h-64 object-contain border border-gray-200 rounded-md"
                          />
                        ) : (
                          <div className="text-gray-500 text-sm">No identification image</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {user.identityFile ? (
                        <>
                          <div
                            className="text-xs text-gray-600 max-w-md truncate"
                            title={decodeURIComponent((user.identityFile || "").split("/").pop() || "")}
                          >
                          </div>
                          <img
                            src={resolveImg(user.identityFile)}
                            alt="identification"
                            className="w-full max-w-52 max-h-52 object-contain border border-gray-200 rounded-md"
                          />
                        </>
                      ) : (
                        <div className="text-black break-words">-</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-2">
                {editMode ? (
                  <>
                    <button type="button" onClick={handleCancel} className="btn btn-ghost sm:px-6">Cancel</button>
                    <button type="submit" disabled={isSaving} className="btn btn-success sm:px-6">
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleSwitchRole} className="btn bg-green-500 text-black font-semibold border-none sm:px-6">Switch Role</button>
                    <button type="button" onClick={() => setShowLogoutModal(true)} className="btn bg-red-500 text-black font-semibold border-none sm:px-6">Logout</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

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
  );
}
