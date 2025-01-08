import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Book, Home, Ticket } from 'lucide-react';

const AppSidebar = () => {
  return (
    <aside className="h-full w-16 flex flex-col items-center py-8 bg-white border-r">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `w-12 h-12 flex items-center justify-center rounded-lg mb-4 hover:bg-gray-100 ${
            isActive ? 'bg-gray-100' : ''
          }`
        }
      >
        <Home className="w-6 h-6 text-gray-600" />
      </NavLink>
      
      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          `w-12 h-12 flex items-center justify-center rounded-lg mb-4 hover:bg-gray-100 ${
            isActive ? 'bg-gray-100' : ''
          }`
        }
      >
        <Heart className="w-6 h-6 text-gray-600" />
      </NavLink>

      <NavLink
        to="/my-books"
        className={({ isActive }) =>
          `w-12 h-12 flex items-center justify-center rounded-lg mb-4 hover:bg-gray-100 ${
            isActive ? 'bg-gray-100' : ''
          }`
        }
      >
        <Book className="w-6 h-6 text-gray-600" />
      </NavLink>

      <NavLink
        to="/my-coupons"
        className={({ isActive }) =>
          `w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 ${
            isActive ? 'bg-gray-100' : ''
          }`
        }
      >
        <Ticket className="w-6 h-6 text-gray-600" />
      </NavLink>
    </aside>
  );
};

export default AppSidebar;