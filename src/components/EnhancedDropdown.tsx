import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaSearch, FaStar } from 'react-icons/fa';
import { useTheme } from '@hooks/useTheme';

interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface EnhancedDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  allowFavorites?: boolean;
  className?: string;
}

const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  allowFavorites = false,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dropdown_favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const filteredOptions = getFilteredOptions();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            handleSelect(filteredOptions[selectedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchTerm]);

  const getFilteredOptions = () => {
    let filtered = options;
    
    if (searchTerm) {
      filtered = filtered.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort favorites to top
    if (allowFavorites) {
      filtered = filtered.sort((a, b) => {
        const aFav = favorites.has(a.value);
        const bFav = favorites.has(b.value);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    }

    return filtered;
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(0);
  };

  const toggleFavorite = (optionValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(optionValue)) {
      newFavorites.delete(optionValue);
    } else {
      newFavorites.add(optionValue);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('dropdown_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = getFilteredOptions();

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between transition-all duration-200 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-white'
            : 'bg-white border-gray-300 hover:border-gray-400 text-black'
        }`}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <FaChevronDown className="text-sm" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute z-50 w-full mt-2 rounded-lg border shadow-xl overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}
          >
            {/* Search Input */}
            {searchable && (
              <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedIndex(0);
                    }}
                    placeholder="Search..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No options found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <motion.div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                      index === selectedIndex
                        ? isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                        : ''
                    } ${
                      option.value === value
                        ? isDarkMode
                          ? 'bg-blue-900/30'
                          : 'bg-blue-50'
                        : ''
                    } ${
                      isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                    {allowFavorites && (
                      <button
                        onClick={(e) => toggleFavorite(option.value, e)}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(option.value)
                            ? 'text-yellow-500'
                            : isDarkMode
                            ? 'text-gray-600 hover:text-yellow-500'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <FaStar />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedDropdown;
