import React, { useState } from 'react';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import '../DaisyUI.css';

const PostCard = ({ post, currentUser, onDelete, onEdit }) => {
  const [confirmAction, setConfirmAction] = useState(null);

  // ✅ ตรวจสอบเจ้าของโพสต์
  const isOwner = currentUser && post && Number(currentUser.id) === Number(post.user_id);
  console.log('Current user:', currentUser?.id, 'Post user_id:', post.user_id);
  return (
    <div className="relative card w-full bg-white shadow-lg rounded-xl border border-gray-200 p-4 text-black">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={post.avatar ? `http://localhost:5000/uploads/${post.avatar}` : 'https://i.pravatar.cc/150'}
            alt="avatar"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-base">{post.nickname || 'ไม่ระบุชื่อ'}</div>
            <div className="text-sm text-gray-500">{post.username || '@username'}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="badge badge-success">{post.status_name || ''}</div>
          <div className="text-red-600 font-bold text-xl mt-1">
            {post.service_fee ? `${post.service_fee} ฿` : '0 ฿'}
          </div>
        </div>
      </div>

      {/* Post details */}
      <div className="mt-4 text-sm space-y-1">
        <p><span className="font-semibold">สถานที่ส่ง</span> : {post.delivery || '-'}</p>
        <p><span className="font-semibold">ชื่อร้าน</span> : {post.store_name || '-'}</p>
        <p><span className="font-semibold">หิ้ว</span> : {post.product || '-'}</p>
        <p><span className="font-semibold">ราคา</span> : {post.price || '-'}</p>
        <p><span className="font-semibold">ตลาด</span> : {post.kad_name || '-'}</p>
        <p><span className="font-semibold">เวลาจัดส่ง</span> : {post.delivery_at || '-'}</p>
      </div>

      {/* Edit/Delete ปุ่ม */}
      <div className={isOwner ? 'mt-4 flex justify-end gap-2' : 'hidden'}>
        <button
          className="btn btn-sm btn-error text-white"
          onClick={() => setConfirmAction('delete')}
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
      {confirmAction === 'delete' && (
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
                ลบเลย
              </button>
              <button className="btn" onClick={() => setConfirmAction(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
