import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

function Settings() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
          <div className="mt-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue={user?.email}
                readOnly
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Contact support to change your email address
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Connected Business</h2>
          <div className="mt-4">
            {user?.businessName ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.businessName}</p>
                  <p className="text-sm text-gray-500">Connected via Yelp</p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-900">
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No business connected</p>
                <a
                  href="/connect-business"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Connect Your Business
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;