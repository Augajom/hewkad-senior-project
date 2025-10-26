// utils/handleUnauthorized.js
import Swal from "sweetalert2";

export async function handleUnauthorized(status) {
  if (status === 498) {
    await Swal.fire({
      icon: "warning",
      title: "กรุณาเข้าสู่ระบบ",
      confirmButtonText: "กลับหน้า Login",
    }).then(() => {
      window.location.href = "/";
    });
  } else if (status === 499) {
    await Swal.fire({
      icon: "error",
      title: "ไม่มีสิทธิ์เข้าถึง",
      confirmButtonText: "กลับหน้า Login",
    }).then(() => {
      window.location.href = "/";
    })
  }
}
