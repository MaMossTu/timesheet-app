"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Building2,
  User,
  Calendar,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  code?: string;
  description?: string;
  approvedBy?: string;
  dateSign?: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  prefix?: string;
  companies?: Company[];
  selectedCompanyId?: string;
}

interface CompanyManagementProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAddCompany: (company: Omit<Company, "id">) => Promise<boolean>;
  onUpdateCompany: (
    companyId: string,
    updates: Partial<Company>
  ) => Promise<boolean>;
  onDeleteCompany: (companyId: string) => Promise<boolean>;
}

export function CompanyManagement({
  isOpen,
  onClose,
  user,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
}: CompanyManagementProps) {
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    approvedBy: "",
    dateSign: "",
  });
  const [editData, setEditData] = useState<Company | null>(null);

  if (!isOpen) return null;

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    const success = await onAddCompany({
      name: newCompany.name.trim(),
      approvedBy: newCompany.approvedBy.trim() || undefined,
      dateSign: newCompany.dateSign.trim() || undefined,
    });

    if (success) {
      setNewCompany({ name: "", approvedBy: "", dateSign: "" });
      setShowAddForm(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company.id);
    setEditData({ ...company });
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    const success = await onUpdateCompany(editData.id, {
      name: editData.name.trim(),
      approvedBy: editData.approvedBy?.trim() || undefined,
      dateSign: editData.dateSign?.trim() || undefined,
    });

    if (success) {
      setEditingCompany(null);
      setEditData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setEditData(null);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (
      window.confirm(
        "⚠️ ต้องการลบบริษัทนี้หรือไม่?\n\nข้อมูล timesheet ทั้งหมดจะถูกลบด้วย"
      )
    ) {
      await onDeleteCompany(companyId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Companies
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Add New Company Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>

            {/* Add Company Form */}
            {showAddForm && (
              <div className="mb-6 space-y-4">
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={newCompany.approvedBy}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          approvedBy: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Date Sign (Day)
                    </label>
                    <select
                      value={newCompany.dateSign}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          dateSign: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    >
                      <option value="">Select day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <option
                            key={day}
                            value={day.toString().padStart(2, "0")}
                          >
                            {day}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewCompany({
                          name: "",
                          approvedBy: "",
                          dateSign: "",
                        });
                      }}
                      className="px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Companies List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Your Companies ({user?.companies?.length || 0})
              </h3>

              {user?.companies && user.companies.length > 0 ? (
                user.companies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {editingCompany === company.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={editData?.name || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            Approved By
                          </label>
                          <input
                            type="text"
                            value={editData?.approvedBy || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                approvedBy: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                            placeholder="e.g., John Smith"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Date Sign (Day)
                          </label>
                          <select
                            value={editData?.dateSign || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                dateSign: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                          >
                            <option value="">Select day</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option
                                  key={day}
                                  value={day.toString().padStart(2, "0")}
                                >
                                  {day}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {company.name}
                              {company.id === user.selectedCompanyId && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          {company.approvedBy && (
                            <div className="text-xs text-gray-500 mb-1">
                              Approved by: {company.approvedBy}
                            </div>
                          )}
                          {company.dateSign && (
                            <div className="text-xs text-gray-500">
                              Date Sign: {company.dateSign}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No companies yet</p>
                  <p className="text-gray-400 text-xs">
                    Add your first company to get started
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
