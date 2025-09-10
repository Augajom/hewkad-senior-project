import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const showUserPayment = () => {
  MySwal.fire({
    title: '<div style="font-size:32px; font-weight:bold; color:#333;">Approve Payment</div>',
    html: `
      <div style="display: flex; text-align: center; justify-content: center; flex-direction: column;">
        <img src="/src/assets/qr-code.svg" alt="QR Code" style="margin: 20px; height: 22rem;" />
        <div>
          <p style="color:black; font-size: 20px; font-weight: bold;">KASIKORNBANK</p>
          <p style="color:#807a7a; font-size: 24px; font-weight: 400; margin-top: 2px;">049-00009-9-00</p>
          <p style="color:#807a7a; font-size: 18px; font-weight: 400;">ก้วย ปากิน</p>
        </div>
      </div>
    `,
    background: "#ffffff",
    width: 600,
    padding: "1em",
    backdrop: true,
    showCancelButton: true,
    confirmButtonColor: "#00c950",
    cancelButtonColor: "gray",
    cancelButtonText: "Cancel",
    confirmButtonText: "Confirm",
    reverseButtons: true,
    customClass: {
      popup: "rounded-2xl shadow-lg",
      container: "backdrop-blur",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // หลังจากกด Confirm ในหน้าสแกน
      MySwal.fire({
        title: '<div style="font-size:32px; font-weight:bold; color:#333;">Confirm Payment</div>',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <input type="file" id="upload" style="display: none;" />
            <label for="upload" style="background-color: #F1F1F1; padding:10px 30px; border-radius:10px; cursor:pointer;">
              File |
              <span id="file-name" style="margin-top: 10px; color: #555;">No file selected</span>
            </label>
          </div>
        `,
        background: "#fff",
        width: 600,
        padding: "1em",
        backdrop: true,
        showCancelButton: true,
        confirmButtonColor: "#00c950",
        cancelButtonColor: "gray",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
        reverseButtons: true,
        customClass: {
          popup: "rounded-xl shadow-lg",
          container: "backdrop-blur",
        },
        didOpen: () => {
          const uploadInput = document.getElementById("upload");
          const fileNameText = document.getElementById("file-name");

          uploadInput.addEventListener("change", () => {
            if (uploadInput.files.length > 0) {
              fileNameText.innerText = uploadInput.files[0].name;
            } else {
              fileNameText.innerText = "No file selected";
            }
          });
        },
      }).then((uploadResult) => {
        if (uploadResult.isConfirmed) {
          // หลังจากกด Confirm ในหน้าที่อัปโหลดไฟล์
          MySwal.fire({
            title: '<span style="color:#333;">Payment Completed</span>',
            text: 'The payment has been successfully completed.',
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
    }
  });
};

export const showRejectPayment = () => {
  MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Payment Rejection</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">Are you sure you want to <br/>reject this payment?</p>
          <p style="color:red; font-size: 22px; font-weight: 400;">Name(@XXXXX)?</p>
        </div>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "red",
    cancelButtonColor: "gray",
    cancelButtonText: "Cancel",
    confirmButtonText: "Reject",
    reverseButtons: true,
    background: "#ffffff",
    customClass: {
      popup: "rounded-xl shadow-lg",
      container: "backdrop-blur",
    },
    backdrop: true,
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: '<span style="color:#333;">Payment Rejected</span>',
        text: "The payment has been successfully rejected.",
        icon: "error",
        confirmButtonColor: "red",
        background: "#fff",
        customClass: {
          popup: "rounded-xl shadow-lg",
          container: "backdrop-blur",
        },
        backdrop: true,
      });
    }
  });
};
