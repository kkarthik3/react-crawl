import React from 'react';
import { Home, Search, LibraryBig, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Search size={20} />, label: 'Product search', path: '/productsearch' },
    { icon: <LibraryBig size={20} />, label: 'Knowledgebase', path: '/Knowledgebase' }
  ];

  return (
    <nav className={`fixed top-0 left-0 h-full bg-black text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button onClick={toggleMenu} className="absolute right-4 top-4 text-white md:hidden">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h1 className={`font-sans text-xl ${!isOpen && 'hidden'}`}>Auto Connect AI</h1>
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
      </div>
    </nav>
  );
};

export default Navbar;