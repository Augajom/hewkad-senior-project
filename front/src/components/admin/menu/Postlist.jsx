import React from "react";
import Nav from "../nav";
// Icon
import { CiSearch } from "react-icons/ci";

function Postlist() {
  return (
    <>
      <Nav />
      <div className="min-h-screen flex items-start justify-center bg-[#F1F1F1] text-black">
        <div className="container mx-auto m-10">
          <div className="w-full mx-auto set-center flex-col ">
            <div className="filter-con flex gap-2">
              {/* Markets */}
              <div className="posts-con relative w-full">
                <p className="absolute top-2 left-5 text-[#807a7a] text-sm">Markets</p>
                <select className="rounded px-4 pb-2 pt-7 w-full bg-white shadow-xl">
                  <option value="All">All</option>
                  <option value="Today">กาดหน้ามอ</option>
                  <option value="Yesterday">กาดในมอ</option>
                </select>
              </div>

              <div className="searh-con relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-120 h-[60px] bg-white shadow-2xl rounded-md pl-6 font-medium text-xl"
                />
                <CiSearch className="absolute size-6 right-4 top-[18px]" />
              </div>
            </div>

            <div className="card-con flex flex-wrap gap-10 justify-center w-full max-w-7xl mx-auto">
              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>

              <div className="card flex items-start justify-center flex-col relative w-auto h-auto mt-10 p-5 rounded-xl bg-white shadow-2xl">
                <p className="total-price absolute text-red-700 text-4xl font-semibold bottom-5 right-5">
                  35฿
                </p>
                <div className="profile-con flex set-center">
                  <img src="/src/assets/avatar.svg" className="rounded-full" />
                  <div className="id-name-con m-2">
                    <p className="font-bold">Name</p>
                    <p className="text-gray-500">@XXXXX</p>
                  </div>
                  <div className="flex justify-start h-16">
                    <div className="status-con">
                      <p className="text-white font-semibold px-4 py-1 bg-green-500 rounded ml-10">
                        status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="details-con mt-2 text-xl">
                  <div className="location">
                    <b>สถานที่ส่ง : </b>F1
                  </div>
                  <div className="store">
                    <b>ชื่อร้าน : </b>นายอ้วนไก่หมี่คลุก
                  </div>
                  <div className="detail">
                    <b>หื้ว : </b>หมี่ไก่ฉีก 1 ถ้วย
                  </div>
                  <div className="price">
                    <b>ราคา : </b>500 บาท
                  </div>
                  <div className="market">
                    <b>ตลาด : </b>กาดในมอ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Postlist;
