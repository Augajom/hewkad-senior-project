import React from 'react';
import { FaPlus } from "react-icons/fa6";
import '../DaisyUI.css'
const CreatePostBox = ({ onClick }) => {
  return (
    <div
      className="w-full h-60 bg-base-100 shadow-xl rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow duration-300 p-4 text-center"
      onClick={onClick}
    >
      <h2 className="text-2xl font-bold mb-2 text-white">Create New Post</h2>
      <div>
        <FaPlus />
      </div>

      
    </div>
  );
};

export default CreatePostBox;