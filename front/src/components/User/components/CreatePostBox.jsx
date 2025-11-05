import React from 'react';
import { FaPlus } from "react-icons/fa6";
import '../DaisyUI.css'
const CreatePostBox = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-[180px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-300 flex flex-col items-center justify-center gap-4 transition-all duration-200 group cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors duration-200">
        <FaPlus className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Create New Post</h3>
        <p className="text-sm text-gray-500 mt-1">Share your delivery request with others</p>
      </div>
    </button>
  );
};

export default CreatePostBox;