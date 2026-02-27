import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query when value changes from outside
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase()),
        );

  const handleSelect = (option) => {
    setQuery(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Allow custom typed values
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setIsOpen(true);
              }}
              className="hover:text-gray-600 transition p-1"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="hover:text-gray-600 transition p-1"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[200] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No exact match found. You can still save it!
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition ${
                    value === option
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
