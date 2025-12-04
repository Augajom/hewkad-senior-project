import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
}


export const showUserInfo = (user) => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">INFORMATION</div>',
    html: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 18px; color: #807a7a; text-align: left; padding-left: 4rem;">
        <div><b>Name:</b> ${user.name}</div>
        <div><b>Address:</b> ${user.address || '-'}</div>
        <div><b>Mobile Number:</b> ${user.phone_num || '-'}</div>
        <div><b>Bank:</b> ${user.bank_name || '-'}</div>
        <div><b>Account Number:</b> ${user.acc_number || '-'}</div>
        <div><b>Account Owner:</b> ${user.acc_owner || '-'}</div>
      </div>
    `,
    background: '#ffffff',
    width: 600,
    padding: '1em',
    backdrop: true,
    confirmButtonColor: '#00c950',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl shadow-lg',
      container: 'backdrop-blur',
    },
  });
};


export const showUserLicense = (identityFile) => {
  const imageUrl = resolveImg(identityFile);

  Swal.fire({
    title: '<div style="font-size:28px; font-weight:bold; color:#333;">IDENTIFICATION</div>',
    html: imageUrl
      ? `
        <div style="display:flex; justify-content:center; align-items:center;">
          <img src="${imageUrl}" alt="User ID" style="max-width:100%; max-height:400px; border-radius:12px; border:1px solid #ccc;" />
        </div>
      `
      : `<div style="color:#888; font-size:16px;">No identification uploaded</div>`,
    background: "#fff",
    width: 600,
    padding: "1em",
    backdrop: true,
    confirmButtonColor: "#00c950",
    confirmButtonText: "Close",
    customClass: {
      popup: "rounded-2xl shadow-lg",
      container: "backdrop-blur",
    },
  });
};

export const showUserDelete = (user) => {
  return MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Account Deletion</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want <br />to delete the account?</p>
          <p style="color:#807a7a; font-size: 22px; font-weight: 400;">Name(${user.name})?</p>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'red',
    cancelButtonColor: 'gray',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm',
    reverseButtons: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg',
      container: 'backdrop-blur',
    },
    backdrop: true,
  });
};


export const showAllowPermitUser = () => {
  return MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Work Permit Approval</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to allow<br/>this service provider to work?</p>
          <p style="color:#807a7a; font-size: 22px; font-weight: 400;">Name(@XXXXX)?</p>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#00c950',
    cancelButtonColor: 'gray',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm',
    reverseButtons: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg',
      container: 'backdrop-blur',
    },
    backdrop: true,
  });
};

export const showDisablePermitUser = () => {
  return MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Work Permit Disable</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to disable<br/>this service provider permit to work?</p>
          <p style="color:red; font-size: 22px; font-weight: 400;">Name(@XXXXX)?</p>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'red',
    cancelButtonColor: 'gray',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm',
    reverseButtons: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg',
      container: 'backdrop-blur',
    },
    backdrop: true,
  });
};

// Request page

export const showConfirmVerify = async (userId, username) => {
  Swal.fire({
    html: `
      <div style="text-align:center;">
        <p style="color:black; font-size: 24px; font-weight: bold;">Confirm User Verification</p>
        <p style="color:#807a7a; font-size: 22px; font-weight: 400; margin-top: 10px;">Are you sure you want to verify <b>@${username}</b>?</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#00c950",
    cancelButtonColor: "gray",
    cancelButtonText: "Cancel",
    confirmButtonText: "Confirm",
    reverseButtons: true,
    background: "#ffffff",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/admin/users/request/update/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isActive: 1 }),
        });

        if (!res.ok) throw new Error("Failed to verify user");

        Swal.fire({
          title: '<span style="color:#333;">User Verified</span>',
          text: "The user has been successfully verified.",
          icon: "success",
          confirmButtonColor: "#00c950",
          background: "#fff",
        }).then(() => {
          window.location.reload();
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to verify user", "error");
      }
    }
  });
};

export const showRejectVerify = async (userId, username) => {
  Swal.fire({
    html: `
      <div style="text-align:center;">
        <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Rejection</p>
        <p style="color:#807a7a; font-size: 22px; font-weight: 400; margin-top: 10px;">Are you sure you want to reject <b>@${username}</b>?</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "red",
    cancelButtonColor: "gray",
    cancelButtonText: "Cancel",
    confirmButtonText: "Confirm",
    reverseButtons: true,
    background: "#ffffff",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/admin/users/request/update/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isActive: 0 }),
        });

        if (!res.ok) throw new Error("Failed to reject user");

        Swal.fire({
          title: '<span style="color:#333;">User Rejected</span>',
          text: "The user has been successfully declined.",
          icon: "error",
          confirmButtonColor: "red",
          background: "#fff",
        }).then(() => {
          window.location.reload();
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to reject user", "error");
      }
    }
  });
};

// History Page

export const showUserSlip = (slipUrl) => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">SLIP</div>',
    html: `
      <div style="display: flex; text-align: center; justify-content: center; height: 28rem;">
        <img src="${slipUrl}" alt="Slip" style="max-height:100%; max-width:100%;" />
      </div>
    `,
    background: '#ffffff',
    width: 600,
    padding: '1em',
    backdrop: true,
    confirmButtonColor: '#00c950',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl shadow-lg',
      container: 'backdrop-blur',
    },
  });
};

export const showUserReportDetail = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">ไม่ได้รับอาหาร</div>',
    html: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 22px; padding: 1rem; color: #807a7a; text-align: center; box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);">
        <div>คนส่ง บอกอาหารถึงแล้ว แต่ไม่มี ไปดูแล้วก็ไม่มี</div>
      </div>
    `,
    background: '#ffffff',
    width: 600,
    padding: '1em',
    backdrop: true,
    confirmButtonColor: '#00c950',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl shadow-lg',
      container: 'backdrop-blur',
    },
  });
};

export const showResolvedDetail = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">Resolved Details</div>',
    html: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 22px; padding: 1rem; color: #807a7a; text-align: center; box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);">
        <div>คืนเงินลูกค้า ปลดคนส่งออกจากการเป็นผู้ส่ง</div>
      </div>
    `,
    background: '#ffffff',
    width: 600,
    padding: '1em',
    backdrop: true,
    confirmButtonColor: '#00c950',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl shadow-lg',
      container: 'backdrop-blur',
    },
  });
};

export const confirmResolve = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">Resolve Details</div>',
    html: `
        <textarea style="border: 1px black solid; border-radius: 4px; height: 12rem; width: 28rem; padding: 1rem; font-size: 26px; max-width: 28rem;"></textarea>
    `,
    showCancelButton: true,
    confirmButtonColor: '#00c950',
    cancelButtonColor: 'gray',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm',
    reverseButtons: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg',
      container: 'backdrop-blur',
    },
    backdrop: true,
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: '<span style="color:#333;">Problem Resolved</span>',
        text: 'The issue has been resolved successfully.',
        icon: 'success',
        confirmButtonColor: '#00c950',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-lg',
          container: 'backdrop-blur',
        },
        backdrop: true,
      });
    }
  });
};