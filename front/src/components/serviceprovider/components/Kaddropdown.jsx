import React, { useState } from 'react';
import { SlArrowDown } from "react-icons/sl";

export default function KadDropdown({ kadOptions, selectedKad, setSelectedKad }) {
    const [open, setOpen] = useState(false);

    const toggleKad = (kadName) => {
        if (selectedKad.includes(kadName)) {
            setSelectedKad(selectedKad.filter(k => k !== kadName));
        } else {
            setSelectedKad([...selectedKad, kadName]);
        }
    };

    return (
        <div className="dropdown mt-5 ml-6 w-52">
            {/* ปุ่ม dropdown */}
            <label tabIndex={0} className="btn w-full flex justify-between items-center bg-white text-black border-black rounded-lg cursor-pointer">
                {selectedKad.length > 0 ? selectedKad.join(', ') : 'Select Kad'}
                <SlArrowDown className="ml-2" />
            </label>

            {/* รายการ checkbox */}
            <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-white rounded-box w-full max-h-60 overflow-auto border border-black text-black"
            >
                {kadOptions.map((kad) => (
                    <li key={kad.id}>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-neutral"
                                checked={selectedKad.includes(kad.kad_name)}
                                onChange={() => toggleKad(kad.kad_name)}
                            />
                            {kad.kad_name}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}
