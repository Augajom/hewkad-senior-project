import React, { useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import "../DaisyUI.css";

const PostCard = ({ post, currentUser, onDelete, onEdit }) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const isOwner =
    currentUser && post && Number(currentUser.id) === Number(post.user_id);
  console.log("Current user:", currentUser?.id, "Post user_id:", post.user_id);
  return (
    <div className="relative bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 min-w-0">
            <img
              src={
                post.avatar
                  ? post.avatar.startsWith("http")
                    ? post.avatar
                    : `https://hewkad.com:8443${post.avatar}`
                  : "https://i.pravatar.cc/150"
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {post.nickname || "Anonymous"}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {post.username || "@username"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                post.status_name === "Available"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {post.status_name || ""}
            </span>
            <div className="text-blue-600 font-bold text-xl mt-1">
              ฿{post.service_fee || "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Post details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Store</p>
            <p className="font-medium text-gray-900">
              {post.store_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Market</p>
            <p className="font-medium text-gray-900">{post.kad_name || "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Product</p>
          <p className="font-medium text-gray-900">{post.product || "-"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-medium text-gray-900">฿{post.price || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivery Time</p>
            <p className="font-medium text-gray-900">
              {post.delivery_at || "-"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Delivery Location</p>
          <p className="font-medium text-gray-900">{post.delivery || "-"}</p>
        </div>
      </div>

      {/* Edit/Delete ปุ่ม */}
      <div
        className={isOwner ? "mt-4 mb-2 mr-2 flex justify-end gap-2" : "hidden"}
      >
        <button
          className="btn btn-sm btn-error text-white"
          onClick={() => setConfirmAction("delete")}
          disabled={confirmAction !== null}
        >
          <FaTrashAlt />
        </button>

        <button
          className="btn btn-sm btn-neutral"
          onClick={() => onEdit(post)}
          aria-label="แก้ไขโพสต์"
        >
          <FaEdit />
        </button>
      </div>

      {/* Modal ยืนยันลบ */}
      {confirmAction === "delete" && (
        <div className="modal modal-open">
          <div className="modal-box bg-white text-black">
            <h3 className="font-bold text-lg text-black">ยืนยันการลบ</h3>
            <p className="py-4">คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?</p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => {
                  onDelete(post.id);
                  setConfirmAction(null);
                }}
              >
                Delete
              </button>
              <button className="btn" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
