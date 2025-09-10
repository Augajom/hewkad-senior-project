import React, { useEffect, useState } from "react";
import Nav from "../nav";
// Graph
import PostChart10Days from "./features/PostChart10Days";
// Icon
import { BiTrendingUp } from "react-icons/bi";
import { MdOutlinePending } from "react-icons/md";
import { LuShoppingCart } from "react-icons/lu";
import { GiFlatPlatform } from "react-icons/gi";
import { MdOutlineBorderColor } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
// Date-Range
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Dashboard() {
  const [dateRange, setDateRange] = useState("All");
  const [customDate, setCustomDate] = useState({ start: null, end: null });

  return (
    <>
      <Nav />
      <div className="h-screen flex items-start justify-center bg-[#F1F1F1]">
        <div className="container m-6 max-w-300 ">

          <div className="filter-con flex gap-5 mb-5">

            {/* Date Range */}
            <div className="date-range-con flex gap-2 relative w-full">
              <p className="absolute top-2 left-5 text-[#807a7a] text-sm">Date Range</p>
              <MdDateRange className="absolute bottom-3 left-5"/>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded px-9 pb-2 pt-7 w-full bg-white shadow-xl"
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Year">This Year</option>
                <option value="Last Year">Last Year</option>
                <option value="Custom Range">Custom Range</option>
              </select>

              {/* โชว์ Date Picker ถ้าเลือก Custom Range */}
              {dateRange === "Custom Range" && (
                <div className="flex flex-row gap-2">
                  <DatePicker
                    selected={customDate.start}
                    onChange={(date) =>
                      setCustomDate((prev) => ({ ...prev, start: date }))
                    }
                    selectsStart
                    startDate={customDate.start}
                    endDate={customDate.end}
                    placeholderText="Start Date"
                    className="rounded text-center px-4 py-4 w-full bg-white shadow-xl no-blink-cursor"
                    onClick={(e) => e.currentTarget.focus()}
                  />
                  <DatePicker
                    selected={customDate.end}
                    onChange={(date) =>
                      setCustomDate((prev) => ({ ...prev, end: date }))
                    }
                    selectsEnd
                    startDate={customDate.start}
                    endDate={customDate.end}
                    minDate={customDate.start}
                    placeholderText="End Date"
                    className="rounded text-center px-4 py-4 w-full bg-white shadow-xl no-blink-cursor"
                    onClick={(e) => e.currentTarget.focus()}
                  />
                </div>
              )}
            </div>

              {/* Post */}
            <div className="posts-con relative w-full">
              <p className="absolute top-2 left-5 text-[#807a7a] text-sm">Posts</p>
              <select
                className="rounded px-4 pb-2 pt-7 w-full bg-white shadow-xl"
              >
                <option value="All">All</option>
                <option value="Today">กาดหน้ามอ</option>
                <option value="Yesterday">กาดในมอ</option>
              </select>

            </div>


          </div>

          <div className="1line-con flex gap-10 min-h-50 mb-8">
            <div className="total-revenue-con set-center flex-col w-100 h-auto rounded-xl bg-white shadow-2xl">
              <div className="icon-con size-12 rounded-full bg-[#fe8052] set-center">
                <BiTrendingUp className="size-7 " />
              </div>
              <p className="text-xl font-semibold m-1">Total Revenue</p>
              <p className="text-3xl font-bold m-1">฿220,015</p>
              {/* <p className="text-md font-semibold">Last 24 Hours</p> */}
            </div>

            <PostChart10Days />

            <div className="pending-revenue-con set-center flex-col w-100 h-auto rounded-xl bg-white shadow-2xl">
              <div className="icon-con size-12 rounded-full bg-[#3ef3b6] set-center">
                <MdOutlinePending className="size-7 " />
              </div>
              <p className="text-xl font-semibold m-1">Pending Revenue</p>
              <p className="text-3xl font-bold m-1">฿2,546</p>
              {/* <p className="text-md font-semibold">Cash Flow</p> */}
            </div>
          </div>

          <div className="2line-con flex gap-10 max-h-50 mb-8">
            <div className="paid-out-to-shoppers-con set-center flex-col p-8 w-full rounded-xl bg-white shadow-2xl">
              <div className="icon-con size-12 rounded-full bg-[#fc7782] set-center">
                <LuShoppingCart className="size-7 " />
              </div>
              <p className="text-xl font-semibold m-1">Paid Out To Shoppers</p>
              <p className="text-3xl font-bold m-1">฿174,210</p>
              {/* <p className="text-md font-semibold">Last 24 Hours</p> */}
            </div>

            <div className="platform-fees-con set-center flex-col p-8 w-full rounded-xl bg-white shadow-2xl">
              <div className="icon-con size-12 rounded-full bg-[#fdbd46] set-center">
                <GiFlatPlatform className="size-7 " />
              </div>
              <p className="text-xl font-semibold m-1">Platform Fees (30%)</p>
              <p className="text-3xl font-bold m-1">฿70,110</p>
              {/* <p className="text-md font-semibold">Last 1 Month</p> */}
            </div>

            <div className="total-orders-con set-center flex-col p-8 w-full rounded-xl bg-white shadow-2xl">
              <div className="icon-con size-12 rounded-full bg-[#af52de] set-center">
                <MdOutlineBorderColor className="size-7 " />
              </div>
              <p className="text-xl font-semibold m-1">Total Orders</p>
              <p className="text-3xl font-bold m-1">1,015</p>
              {/* <p className="text-md font-semibold">All</p> */}
            </div>
          </div>

          <div className="3line-con flex gap-10 max-h-20">
            <div className="avaliable-con set-center py-15 flex-col p-8 w-full rounded-xl bg-[#007aff] shadow-2xl">
              <p className="text-xl font-semibold m-1">Avaliabled</p>
              <p className="text-3xl font-bold m-1">2,492</p>
            </div>

            <div className="ordering-con set-center py-15 flex-col p-8 w-full rounded-xl bg-[#ffcc00] shadow-2xl">
              <p className="text-xl font-semibold m-1">Ordering</p>
              <p className="text-3xl font-bold m-1">204</p>
            </div>

            <div className="complete-con set-center py-15 flex-col p-8 w-full rounded-xl bg-[#34c759] shadow-2xl">
              <p className="text-xl font-semibold m-1">Completed</p>
              <p className="text-3xl font-bold m-1">1,203</p>
            </div>

            <div className="disable-con set-center py-15 flex-col p-8 w-full rounded-xl bg-[#ff3b30] shadow-2xl">
              <p className="text-xl font-semibold m-1">Disabled</p>
              <p className="text-3xl font-bold m-1">198</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
