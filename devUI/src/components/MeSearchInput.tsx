import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface MeSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MeSearchInput: React.FC<MeSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative border border-grey-more rounded ${className}`}>
      <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white' />
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='me_input_better py-1 pl-8 pr-8 w-full'
        tabIndex={-1}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className='absolute right-1 top-1/2 transform -translate-y-1/2 text-white hover:text-grey focus:outline-none'
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default MeSearchInput;
