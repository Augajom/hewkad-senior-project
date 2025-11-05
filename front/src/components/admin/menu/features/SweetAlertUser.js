import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showUserInfo = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">INFORMATION</div>',
    html: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 22px; color: #807a7a; text-align: left; padding-left: 4rem;">
        <div><b>Name:</b> Name (@XXXXX)</div>
        <div><b>Address:</b> ........</div>
        <div><b>Mobile Number:</b> 083-.....</div>
        <div><b>Bank:</b> Siam Commercial</div>
        <div><b>Account Number:</b> ........</div>
        <div><b>Name Number:</b> .............</div>
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

export const showUserLicense = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">LICENSE</div>',
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <img src="/src/assets/license.jpg" alt="" />
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

export const showUserDelete = () => {
  MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Account Deletion</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want <br />to delete the account?</p>
          <p style="color:#807a7a; font-size: 22px; font-weight: 400;">Name(@XXXXX)?</p>
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
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: '<span style="color:#333;">User Deleted</span>',
        text: 'The User Has Been Successfully Removed.',
        icon: 'error',
        confirmButtonColor: 'red',
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

export const showConfirmVerify = () => {
  MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm User Verification</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to verify</p>
          <p style="color:#807a7a; font-size: 22px; font-weight: 400;">@User2?</p>
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
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: '<span style="color:#333;">User Verified</span>',
        text: 'The User Has Been Successfully Verified.',
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

export const showRejectVerify = () => {
  MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Rejection</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to reject  </p>
          <p style="color:#807a7a; font-size: 22px; font-weight: 400;">@User2?</p>
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
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: '<span style="color:#333;">User Rejected </span>',
        text: 'The User Has Been Successfully Declined.',
        icon: 'error',
        confirmButtonColor: 'red',
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

// Activity Page

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