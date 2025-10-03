import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../DaisyUI.css";

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000";

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
    identityFileName: ""
  });
  const [editUser, setEditUser] = useState(user);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

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
        identityFile: "",
        identityFileName: ""
      };
      setUser(next);
      setEditUser(next);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
    } catch {
      alert("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoaded(true);
    }
  }, [navigate, avatarPreview]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = () => setEditMode(true);

  const onUploadAvatar = useCallback(async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/upload/avatar`, {
      method: "POST",
      credentials: "include",
      body: form
    });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Upload failed");
    const url = data.url;
    const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const tmp = URL.createObjectURL(file);
    setAvatarPreview(tmp);
    setEditUser((p) => ({ ...p, picture: bust }));
    await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ picture: url })
    });
    await loadProfile();
  }, [avatarPreview, loadProfile]);

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
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Bad response ${res.status}: ${text.slice(0, 200)}`);
      }
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

  const handleCancel = () => {
    setEditUser(user);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
    }
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((p) => ({ ...p, [name]: value ?? "" }));
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    navigate("/", { replace: true });
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
                <img
                  key={currentImg}
                  src={currentImg}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              {editMode && (
                <label
                  htmlFor="profileUpload"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full"
                  title="Upload new avatar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v13H3V7z" />
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
                onUploadAvatar(file).catch((err) => alert(err.message));
                e.currentTarget.value = "";
              }}
            />
          </div>
          {!editMode && (
            <button onClick={handleEdit} className="btn btn-link mt-2 text-primary no-underline">
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loaded || isSaving) return;
              handleSave();
            }}
          >
            <div className="space-y-4">
              {[
                { label: "Nickname :", name: "nickname", value: editUser.nickname },
                { label: "Name-Surname :", name: "fullName", value: editUser.fullName },
                { label: "Phone :", name: "phone", value: editUser.phone },
                { label: "Address :", name: "address", value: editUser.address }
              ].map((f) => (
                <div className="flex items-center" key={f.name}>
                  <label className="text-black w-45 mr-2">{f.label}</label>
                  {editMode ? (
                    <input
                      name={f.name}
                      value={f.value || ""}
                      onChange={handleChange}
                      className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                    />
                  ) : (
                    <div className="text-black">{user[f.name] || ""}</div>
                  )}
                </div>
              ))}

              <div className="flex items-center">
                <label className="text-black w-45 mr-2">Email :</label>
                <div className="text-black">{user.email}</div>
              </div>
            </div>

            <div className="mt-8 text-black text-center font-semibold">Payment Information (Optional)</div>
            <div className="text-center text-xs text-gray-500 mb-4">
              A User Who Wants To Be A Service Provider Should Focus On Delivering Quality And Meeting Customer Needs
            </div>

            {[
              { label: "Bank :", name: "bank", value: editUser.bank },
              { label: "Account Number :", name: "accountNumber", value: editUser.accountNumber },
              { label: "Account Owner :", name: "accountOwner", value: editUser.accountOwner }
            ].map((f) => (
              <div className="flex items-center" key={f.name}>
                <label className="text-black w-45 mr-2">{f.label}</label>
                {editMode ? (
                  <input
                    name={f.name}
                    value={f.value || ""}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black"
                  />
                ) : (
                  <div className="text-black">{user[f.name] || ""}</div>
                )}
              </div>
            ))}

            <div className="flex items-center mt-4">
              <label className="text-black w-45 mr-2">Identity File :</label>
              {editMode ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditUser((prev) => ({
                        ...prev,
                        identityFile: String(reader.result || ""),
                        identityFileName: file.name
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="file-input file-input-bordered w-full max-w-xs bg-white text-black"
                />
              ) : (
                <div className="text-black">{user.identityFileName ? user.identityFileName : "-"}</div>
              )}
            </div>

            {editMode && (
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={handleCancel} className="btn btn-neutral" disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={!loaded || isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </form>

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
                  <button className="btn btn-ghost px-8 py-3 rounded-full text-red-500 bg-white" onClick={() => setShowLogoutModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-success px-8 py-3 rounded-full text-black" onClick={handleLogout}>
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
