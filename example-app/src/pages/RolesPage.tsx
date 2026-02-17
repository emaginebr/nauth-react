import { useState } from 'react';
import { RoleList, RoleForm } from 'nauth-react';
import type { RoleInfo } from 'nauth-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/Card';

type ModalMode = 'create' | 'edit' | null;

export default function RolesPage() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (role: RoleInfo) => {
    setSelectedRole(role);
    setModalMode('edit');
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setModalMode('create');
  };

  const handleFormSuccess = (role: RoleInfo) => {
    const message = modalMode === 'create'
      ? `Role "${role.name}" created successfully!`
      : `Role "${role.name}" updated successfully!`;
    
    toast.success(message);
    setModalMode(null);
    setSelectedRole(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleFormError = (error: Error) => {
    toast.error(error.message);
  };

  const handleCancel = () => {
    setModalMode(null);
    setSelectedRole(null);
  };

  const handleDeleteSuccess = () => {
    toast.success('Role deleted successfully!');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleDeleteError = (error: Error) => {
    toast.error(`Failed to delete role: ${error.message}`);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Management Roles
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage user roles and permissions
        </p>
      </div>
      <Card className='pt-5'>
        <CardContent className='space-y-4'>
          <RoleList
            key={refreshTrigger}
            onEdit={(role) => {
              if (role.roleId === 0) {
                handleCreate();
              } else {
                handleEdit(role);
              }
            }}
            onRoleClick={handleEdit}
            onSuccess={handleDeleteSuccess}
            onError={handleDeleteError}
            showCreateButton={true}
            initialPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      {modalMode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {modalMode === 'create' ? 'Create New Role' : 'Edit Role'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <RoleForm
                roleId={selectedRole?.roleId}
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
