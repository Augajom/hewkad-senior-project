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
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                        {selectedKad.length > 0 ? selectedKad.join(', ') : 'Filter by Market'}
                    </span>
                    <SlArrowDown className={`ml-2 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 max-h-60 overflow-auto">
                        {kadOptions.map((kad) => (
                            <label
                                key={kad.id}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                    checked={selectedKad.includes(kad.kad_name)}
                                    onChange={() => toggleKad(kad.kad_name)}
                                />
                                <span className="text-sm text-gray-700">{kad.kad_name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
