/**
 * Complete Role Management Example
 * 
 * This file demonstrates how to use the RoleList and RoleForm components
 * together to create a complete role management system.
 */

import { useState } from 'react';
import { RoleList } from './RoleList';
import { RoleForm } from './RoleForm';
import type { RoleInfo } from '../types';

type ViewMode = 'list' | 'create' | 'edit';

export function RoleManagementExample() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Show notification for 3 seconds
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle edit button click
  const handleEdit = (role: RoleInfo) => {
    setSelectedRole(role);
    setViewMode('edit');
  };

  // Handle successful form submission
  const handleFormSuccess = (role: RoleInfo) => {
    const message = viewMode === 'create'
      ? `Role "${role.name}" created successfully!`
      : `Role "${role.name}" updated successfully!`;
    
    showNotification('success', message);
    setViewMode('list');
    setSelectedRole(null);
  };

  // Handle form errors
  const handleFormError = (error: Error) => {
    showNotification('error', error.message);
  };

  // Handle form cancellation
  const handleCancel = () => {
    setViewMode('list');
    setSelectedRole(null);
  };

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    showNotification('success', 'Role deleted successfully!');
  };

  // Handle deletion errors
  const handleDeleteError = (error: Error) => {
    showNotification('error', `Failed to delete role: ${error.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and permissions
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setViewMode('list')}
            className="hover:text-gray-900 dark:hover:text-gray-200"
          >
            Roles
          </button>
          {viewMode === 'create' && <span> / Create New Role</span>}
          {viewMode === 'edit' && selectedRole && (
            <span> / Edit {selectedRole.name}</span>
          )}
        </nav>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {viewMode === 'list' && (
            <RoleList
              onEdit={handleEdit}
              onRoleClick={handleEdit}
              onSuccess={handleDeleteSuccess}
              onError={handleDeleteError}
              showCreateButton={true}
              initialPageSize={10}
              pageSizeOptions={[10, 25, 50, 100]}
              className="p-6"
            />
          )}

          {viewMode === 'create' && (
            <div className="p-6">
              <RoleForm
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                onCancel={handleCancel}
              />
            </div>
          )}

          {viewMode === 'edit' && selectedRole && (
            <div className="p-6">
              <RoleForm
                roleId={selectedRole.roleId}
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">
            💡 Tips
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>• Use the search bar to quickly find roles by name or slug</li>
            <li>• Slugs are automatically generated from the role name</li>
            <li>• You can customize the slug or leave it empty for auto-generation</li>
            <li>• All role operations require admin privileges</li>
            <li>• Click on a role row to view/edit details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RoleManagementExample;
