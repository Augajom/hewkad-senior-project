import { useEffect, useState } from "react";
import axios from "axios";

const PostChart10Days = () => {
  const [postData, setPostData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "https://hewkad.com/admin/daily-summary",
          {
            withCredentials: true,
          }
        );

        if (Array.isArray(response.data)) {
          const formattedData = response.data.map((item) => {
            const date = new Date(item.date);
            const day = date.getDate();
            const month = date
              .toLocaleString("default", { month: "short" })
              .toUpperCase();
            const label = `${day} ${month}`;

            return {
              label: label,
              count: item.total_orders,
            };
          });

          setPostData(formattedData);
        } else {
          console.error(
            "API /daily-summary did not return an array:",
            response.data
          );
          setPostData([]);
        }
      } catch (error) {
        console.error("Error fetching daily summary:", error);
        setPostData([]);
      }
    };

    fetchChartData();
  }, []);
  const maxCount = Math.max(...postData.map((d) => d.count), 30);

  return (
    <div className="card bg-white rounded-2xl shadow-xl p-6 h-full">
      <h2 className="font-bold text-lg mb-4 text-slate-800">
        TOTAL POST (LAST 10 DAYS)
      </h2>
      <div className="flex items-end justify-between h-full px-2 pt-8 pb-4">
        {postData.map((day, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center h-full justify-end w-6"
          >
            <div className="font-medium text-xs text-slate-600 text-center mb-1">
              {day.count}
            </div>
            <div
              className={`w-6 rounded-t-md relative ${
                idx === postData.length - 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
              style={{
                height: `${(day.count / maxCount) * 100}%`,
                minHeight: "20px",
                transition: "height 0.3s",
              }}
            ></div>
            <div className="text-xs text-slate-500 mt-2">{day.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostChart10Days;
