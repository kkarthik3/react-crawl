import React, { useState } from 'react';
import { Home, Search, LibraryBig, Menu, X ,ArrowRightLeft} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isOpen: boolean;
  toggleMenu: () => void;
  onValuesChange: (values: { apiKey: string; selectedOption: string }) => void; // Callback for parent component
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleMenu, onValuesChange }) => {
  const location = useLocation();
  
  const [apiKey, setApiKey] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    onValuesChange({ apiKey: value, selectedOption }); // Notify parent of changes
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);
    onValuesChange({ apiKey, selectedOption: value }); // Notify parent of changes
  };

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Search size={20} />, label: 'Product search', path: '/productsearch' },
    { icon: <LibraryBig size={20} />, label: 'Knowledgebase', path: '/Knowledgebase' },
    { icon: <ArrowRightLeft size={20} />, label: 'Schema', path: '/Schemamapper' },
  ];

  const dropdownOptions = [
    { value: "", label: 'Please select the model' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3' },
  ];


  return (
    <nav className={`fixed top-0 left-0 h-full bg-black text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button onClick={toggleMenu} className="absolute right-4 top-4 text-white md:hidden">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h1 className={`font-sans text-2xl ${!isOpen && 'hidden'}`}>Auto Connect AI</h1>
        </div>
        <ul className="flex-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className={`${!isOpen && 'hidden'}`}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Input Fields Section */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className={`space-y-3 ${!isOpen && 'hidden'}`}>
            <input
              type="text"
              placeholder="Put Your Valid Groq API Key"
              value={apiKey}
              onChange={handleApiKeyChange}// Notify parent
              
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedOption}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
