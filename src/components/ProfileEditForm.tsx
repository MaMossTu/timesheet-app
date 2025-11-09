"use client";

import React, { useState } from "react";
import { X, User, Save, Key } from "lucide-react";
import { ChangePasswordForm } from "./ChangePasswordForm";

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  prefix?: string;
}

interface ProfileEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: Partial<User>) => Promise<void>;
  onPasswordChange: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  user: User;
}

export function ProfileEditForm({
  isOpen,
  onClose,
  onSubmit,
  onPasswordChange,
  user,
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    prefix: user?.prefix || "",
    name: user?.name || "",
    username: user?.username || "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Prefix Field */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide">
                🏷️ Prefix
              </label>
              <select
                value={formData.prefix}
                onChange={(e) =>
                  setFormData({ ...formData, prefix: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-medium"
              >
                <option value="">Select prefix</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide">
                <User className="w-4 h-4 inline mr-2" />
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-medium"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide">
                👤 Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-medium"
                placeholder="Enter your username"
              />
            </div>

            {/* Change Password Button */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Key className="w-4 h-4" />
                เปลี่ยน Password
              </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 text-sm font-semibold bg-white shadow-sm hover:shadow-md tracking-wide"
              >
                ✕ Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg tracking-wide"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordForm
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        onSubmit={onPasswordChange}
      />
    </div>
  );
}
