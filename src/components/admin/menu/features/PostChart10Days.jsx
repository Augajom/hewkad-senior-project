import { useEffect, useState } from "react";

// ฟังก์ชันสร้างวันที่ย้อนหลัง 10 วัน
const generateMockPostData = () => {
  const data = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" }).toUpperCase();
    const label = `${day} ${month}`;
    const count = Math.floor(Math.random() * 30) + 5; // สุ่ม 5-34 post
    data.push({ label, count });
  }
  return data;
};

const PostChart10Days = () => {
  const [postData, setPostData] = useState([]);

  useEffect(() => {
    // เปลี่ยนเป็น API ได้
    const data = generateMockPostData();
    setPostData(data);
  }, []);

  return (
    <div className="relative flex flex-col justify-end bg-[#ffdede] p-4 rounded-xl mx-auto w-300 h-auto shadow-2xl">
      <h2 className="absolute top-6 left-8 font-bold text-xl mb-4 ">TOTAL POST</h2>
      <div className="flex items-end space-x-8">
        {postData.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className={`w-6 rounded-t-lg relative ${
                idx === postData.length - 1 ? "bg-blue-500" : "bg-[#d0c9e4]"
              }`}
              style={{
                width: "2rem",
                height: `${day.count * 3}px`,
                transition: "height 0.3s",
              }}
            >
              <div className="absolute -top-5 w-full font-semibold text-[14px] text-black text-center">
                {day.count}
              </div>
            </div>
            <div className="text-[10px] mt-1">{day.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostChart10Days;
