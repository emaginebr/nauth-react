import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { RoleFormProps } from '../types';
import { cn } from '../utils/cn';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  slug: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export const RoleForm: React.FC<RoleFormProps> = ({
  roleId,
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { user, getRoleById, createRole, updateRole } = useNAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = roleId !== undefined && roleId > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Load role data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadRole = async () => {
        setIsLoadingRole(true);
        setError(null);

        try {
          const data = await getRoleById(roleId);
          setValue('name', data.name);
          setValue('slug', data.slug);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load role';
          setError(errorMessage);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        } finally {
          setIsLoadingRole(false);
        }
      };

      loadRole();
    }
  }, [roleId, isEditMode, setValue, onError, getRoleById]);

  const onSubmit = async (data: RoleFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        roleId: isEditMode ? roleId : 0,
        name: data.name,
        slug: data.slug || '',
      };

      const result = isEditMode 
        ? await updateRole(payload)
        : await createRole(payload);

      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form if in create mode
      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save role';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setError(null);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Check if user is admin
  const isAdmin = user?.isAdmin ?? false;

  if (!isAdmin) {
    return (
      <div className={cn('flex items-center gap-2 text-destructive', className)}>
        <AlertCircle size={20} />
        <p>You do not have permission to manage roles. Admin access required.</p>
      </div>
    );
  }

  if (isLoadingRole) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  // Preview slug generation
  const previewSlug = slugValue || generateSlug(nameValue);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter role name"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Slug Field */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-sm text-muted-foreground">(optional - auto-generated from name)</span>
          </Label>
          <Input
            id="slug"
            type="text"
            placeholder="Enter custom slug or leave empty"
            {...register('slug')}
            disabled={isLoading}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
          {previewSlug && (
            <p className="text-sm text-muted-foreground">
              Preview: <span className="font-mono">{previewSlug}</span>
            </p>
          )}
        </div>

        {/* Required Fields Note */}
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            {!isEditMode && (
              <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isEditMode ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};
