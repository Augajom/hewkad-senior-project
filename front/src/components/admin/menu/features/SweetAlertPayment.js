import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const MySwal = withReactContent(Swal);

export const showUserPayment = async (order, orderId) => {

  const calPlatformFees = (fee) => {
    if (!fee) return 0;
    return Math.round(fee * 0.3);
  };

  try {
    // ดึงข้อมูล order
    const { data } = await axios.get(
      `http://localhost:5000/admin/payment/${orderId}`,
      { withCredentials: true }
    );
    const order = data.order;

    // รวมยอดทั้งหมด
    const totalAmount =
      (order.order_price || 0) + (order.order_service_fee || 0);

    // แสดง SweetAlert ขั้นแรก
    MySwal.fire({
      title: `<div style="font-size:32px; font-weight:bold; color:#333;">Approve Payment</div>`,
      html: `
        <div style="display: flex; text-align: center; justify-content: center; flex-direction: column;">
          <div>
            <p style="color:black; font-size: 20px; font-weight: bold;">${order.bank_name || "BANK"}</p>
            <p style="color:#807a7a; font-size: 24px; font-weight: 400; margin-top: 2px;">${order.acc_number || "-"}</p>
            <p style="color:#807a7a; font-size: 18px; font-weight: 400;">${order.acc_owner || "-"}</p>
            <p style="color:#807a7a; font-size: 18px; font-weight: 400;">${((order.order_service_fee - calPlatformFees(order.order_service_fee)) + order.order_price)}฿</p>
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
        // เปิด Swal สำหรับอัปโหลดไฟล์
        MySwal.fire({
          title: '<div style="font-size:32px; font-weight:bold; color:#333;">Confirm Payment</div>',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <input type="file" id="file-upload" style="display:none;" accept=".pdf,.xls,.xlsx" />
              <label for="file-upload" 
                style="background-color: #f1f1f1; padding:10px 30px; border-radius:10px; cursor:pointer;">
                แนบไฟล์
              </label>
              <p id="file-name" style="margin-top:10px; color:#555;">ยังไม่ได้เลือกไฟล์</p>
            </div>
          `,
          background: "#fff",
          width: 600,
          padding: "1em",
          showCancelButton: true,
          confirmButtonColor: "#00c950",
          cancelButtonColor: "gray",
          cancelButtonText: "Cancel",
          confirmButtonText: "Upload & Confirm",
          reverseButtons: true,
          customClass: {
            popup: "rounded-xl shadow-lg",
            container: "backdrop-blur",
          },
          didOpen: () => {
            const uploadInput = document.getElementById("file-upload");
            const fileNameText = document.getElementById("file-name");

            uploadInput.addEventListener("change", () => {
              if (uploadInput.files.length > 0) {
                fileNameText.innerText = uploadInput.files[0].name;
              } else {
                fileNameText.innerText = "ยังไม่ได้เลือกไฟล์";
              }
            });
          },
          preConfirm: async () => {
            const uploadInput = document.getElementById("file-upload");
            if (!uploadInput.files.length) {
              Swal.showValidationMessage("กรุณาเลือกไฟล์ก่อนอัปโหลด");
              return false;
            }

            const file = uploadInput.files[0];
            const allowedTypes = [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
              "image/webp",
            ];
            const MAX_FILE_SIZE = 10 * 1024 * 1024;

            if (!allowedTypes.includes(file.type) || file.size > MAX_FILE_SIZE) {
              Swal.showValidationMessage(
                "ต้องเป็นไฟล์รูปภาพขนาดไม่เกิน 10 MB เท่านั้น"
              );
              return false;
            }

            // ✅ ตั้งชื่อไฟล์ใหม่
            const timestamp = new Date()
              .toISOString()
              .replace(/[:.]/g, "-")
              .replace("T", "_")
              .split("Z")[0];
            const ext = file.name.split(".").pop();
            const newFileName = `${order.acc_owner}-${totalAmount}฿-${timestamp}.${ext}`;

            // ✅ สร้าง FormData
            const formData = new FormData();
            formData.append("file", file, newFileName);

            // ✅ อัปโหลดไฟล์
            try {
              const res = await axios.post(
                `http://localhost:5000/admin/upload/${orderId}`,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                  withCredentials: true,
                }
              );

              if (!res.data.success) throw new Error("Upload failed");

              // ✅ ถ้าอัปโหลดสำเร็จ อัปเดตสถานะเป็น 8
              await axios.put(
                `http://localhost:5000/admin/payment/approve/${orderId}`,
                {},
                { withCredentials: true }
              );
            } catch (err) {
              console.error("Upload error:", err);
              Swal.showValidationMessage("การอัปโหลดไฟล์ล้มเหลว");
              return false;
            }
          },
        }).then((uploadResult) => {
          if (uploadResult.isConfirmed) {
            MySwal.fire({
              title: '<span style="color:#333;">Payment Completed</span>',
              text: "The payment has been successfully completed.",
              icon: "success",
              confirmButtonColor: "#00c950",
              background: "#fff",
              customClass: {
                popup: "rounded-xl shadow-lg",
                container: "backdrop-blur",
              },
            }).then(() => {
              window.location.reload();
            });
          }
        });
      }
    });
  } catch (err) {
    console.error(err);
    MySwal.fire({
      title: "Error",
      text: "Failed to fetch order info.",
      icon: "error",
      confirmButtonColor: "red",
      backdrop: true,
    });
  }
};

export const showRejectPayment = async (order) => {
  const result = await MySwal.fire({
    html: `
      <div style="display: flex; text-align: center; justify-content: center;">
        <div>
          <p style="color:black; font-size: 24px; font-weight: bold;">Confirm Payment Rejection</p>
          <p style="color:#807a7a; font-size: 28px; font-weight: 400; margin-top: 10px;">
            Are you sure you want to <br/>reject this payment?
          </p>
          <p style="color:red; font-size: 22px; font-weight: 400;">
            Name(@${order.rider_username || "-"})?
          </p>
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
  });

  if (result.isConfirmed) {
    try {
      await axios.put(
        `http://localhost:5000/admin/payment/reject/${order.order_id}`,
        {},
        { withCredentials: true }
      );

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
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      console.error(err);
      MySwal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to reject payment',
        icon: 'error',
        confirmButtonColor: 'red',
      });
    }
  }
};