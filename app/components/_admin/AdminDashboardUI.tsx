// UI Component: responsible for displaying pure html with props passed from feature component
import * as React from "react";

export const AdminDashboardUI: React.FC = () => {
  return (
    <div className="w-[95%] max-w-[1280px] mx-auto">
      <h1 className="text-4xl font-bold text-blue-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for future functionality */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Bookings</h2>
          <p className="text-gray-600">Manage your bookings and availability</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Pages</h2>
          <p className="text-gray-600">Create and edit multilingual pages</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Payments</h2>
          <p className="text-gray-600">View and manage payment transactions</p>
        </div>
      </div>
    </div>
  );
}; 