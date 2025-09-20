import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../DaisyUI.css";

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000";

function safeParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }
function pickFilled(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) out[k] = v;
  });
  return out;
}
function loadGoogleUser() { return safeParse(localStorage.getItem("user")) || {}; }

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const googleUser = loadGoogleUser();
  const userEmail = googleUser?.email || "";
  const PROFILE_KEY = userEmail ? `profile:${userEmail}` : "profile:anon";
  const cached = safeParse(localStorage.getItem(PROFILE_KEY));

  const defaultState = {
    picture: googleUser.picture || googleUser.imageUrl || "",
    nickname: googleUser.given_name || "",
    fullName: googleUser.name || "",
    email: userEmail || "",
    phone: "",
    address: "",
    bank: "",
    accountNumber: "",
    accountOwner: "",
    identityFile: "",
    identityFileName: "",
  };

  const initial = cached ? { ...defaultState, ...cached } : defaultState;

  const [user, setUser] = useState(initial);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  const writeCache = useCallback((p) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }, [PROFILE_KEY]);

  useEffect(() => {
    const legacy = safeParse(localStorage.getItem("profile"));
    if (legacy && !localStorage.getItem(PROFILE_KEY)) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(legacy));
      localStorage.removeItem("profile");
    }
  }, [PROFILE_KEY]);

  useEffect(() => {
    const base = cached ? { ...defaultState, ...cached } : { ...defaultState };
    setUser(base);
    setEditUser(base);
    setLoaded(false);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          const fromServer = {
            picture: d?.picture ?? "",
            fullName: d?.fullName || d?.name || "",
            email: d?.email || userEmail || "",
            phone: d?.phone || "",
            address: d?.address || "",
            bank: d?.bank || "",
            accountNumber: d?.accountNumber || "",
            accountOwner: d?.accountOwner || "",
          };
          const merged = { ...base, ...pickFilled(fromServer) };
          setUser(merged);
          setEditUser(merged);
          writeCache(merged);
        } else {
          setUser(base);
          setEditUser(base);
          writeCache(base);
        }
      } catch {
        setUser(base);
        setEditUser(base);
        writeCache(base);
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, PROFILE_KEY]);

  const handleEdit = () => setEditMode(true);

  const handleSave = useCallback(async () => {
    const payload = {
      fullName: editUser.fullName || null,
      phone: editUser.phone || null,
      address: editUser.address || null,
      picture: editUser.picture || "",
      bank: editUser.bank || "",
      accountNumber: editUser.accountNumber || null,
      accountOwner: editUser.accountOwner || null,
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

    const p = data.profile || {};
    const latest = {
      picture: p.picture || editUser.picture || "",
      nickname: editUser.nickname || user.nickname || "",
      fullName: p.fullName || p.name || editUser.fullName || "",
      email: p.email || user.email || "",
      phone: p.phone || editUser.phone || "",
      address: p.address || editUser.address || "",
      bank: p.bank || editUser.bank || "",
      accountNumber: p.accountNumber || editUser.accountNumber || "",
      accountOwner: p.accountOwner || editUser.accountOwner || "",
      identityFile: editUser.identityFile || user.identityFile || "",
      identityFileName: editUser.identityFileName || user.identityFileName || "",
    };

    setUser(latest);
    setEditUser(latest);
    writeCache(latest);
    setEditMode(false);
    alert("Profile saved.");
  }, [API_BASE, editUser, user, writeCache]);

  const handleCancel = () => { setEditUser(user); setEditMode(false); };
  const handleChange = (e) => { const { name, value } = e.target; setEditUser((p) => ({ ...p, [name]: value ?? "" })); };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl ml-100 mt-10 flex gap-60 items-start">
        <div className="flex flex-col items-center">
          <div className="avatar relative">
            <div className="w-48 h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center">
              {(editMode ? editUser.picture || user.picture : user.picture) ? (
                <img
                  src={editMode ? editUser.picture || user.picture : user.picture}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : null}
              {editMode && (
                <label htmlFor="profileUpload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition rounded-full">
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
                const reader = new FileReader();
                reader.onloadend = () => { setEditUser((prev) => ({ ...prev, picture: String(reader.result || "") })); };
                reader.readAsDataURL(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="btn btn-link mt-2 text-primary no-underline">
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex-1">
          <form
            onSubmit={(e) => { e.preventDefault(); if (!loaded) return; handleSave().catch((err) => alert(err?.message || "Failed")); }}
          >
            <div className="space-y-4">
              {[
                { label: "Nickname :", name: "nickname", value: editUser.nickname },
                { label: "Name-Surname :", name: "fullName", value: editUser.fullName },
                { label: "Phone :", name: "phone", value: editUser.phone },
                { label: "Address :", name: "address", value: editUser.address },
              ].map((f) => (
                <div className="flex items-center" key={f.name}>
                  <label className="text-black w-45 mr-2">{f.label}</label>
                  {editMode ? (
                    <input name={f.name} value={f.value || ""} onChange={handleChange} className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black" />
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
              { label: "Account Owner :", name: "accountOwner", value: editUser.accountOwner },
            ].map((f) => (
              <div className="flex items-center" key={f.name}>
                <label className="text-black w-45 mr-2">{f.label}</label>
                {editMode ? (
                  <input name={f.name} value={f.value || ""} onChange={handleChange} className="input input-bordered w-full bg-white border-2 border-gray-500 focus:border-gray-600 text-black" />
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
                      setEditUser((prev) => ({ ...prev, identityFile: String(reader.result || ""), identityFileName: file.name }));
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
                <button type="button" onClick={handleCancel} className="btn btn-neutral">Cancel</button>
                <button type="submit" className="btn btn-success">Save</button>
              </div>
            )}
          </form>

          <button onClick={() => setShowLogoutModal(true)} className="fixed bottom-6 right-6 bg-red-500 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-red-600 transition cursor-pointer">
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
