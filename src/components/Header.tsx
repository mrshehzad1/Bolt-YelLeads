import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.businessName}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </button>
          <div className="relative">
            <button className="flex items-center gap-2 rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.email}</span>
            </button>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;