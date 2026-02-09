import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { UserEditFormProps, RoleInfo, UserInfo } from '../types';
import { cn } from '../utils/cn';
import { validateCPF, validateCNPJ, validatePhone, formatPhone } from '../utils/validators';

// Brazilian states
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const phoneSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits').refine(validatePhone, {
    message: 'Invalid phone number format',
  }),
});

const addressSchema = z.object({
  zipCode: z.string().min(8, 'Zip code must be 8 digits').max(8, 'Zip code must be 8 digits'),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  complement: z.string().min(1, 'Complement is required'),
  neighborhood: z.string().min(2, 'Neighborhood must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().length(2, 'State must be 2 characters'),
});

const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
  status: z.number().int().min(1).max(4),
  isAdmin: z.boolean(),
  birthDate: z.string().optional().nullable(),
  idDocument: z.string().optional().refine((val) => {
    if (!val || val.length === 0) return true;
    const cleaned = val.replace(/[^\d]/g, '');
    return validateCPF(cleaned) || validateCNPJ(cleaned);
  }, {
    message: 'Invalid CPF or CNPJ',
  }),
  pixKey: z.string().optional(),
  selectedRoleIds: z.array(z.number()).min(1, 'At least one role must be selected'),
  phones: z.array(phoneSchema).optional(),
  addresses: z.array(addressSchema).optional(),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

export const UserEditForm: React.FC<UserEditFormProps> = ({
  userId,
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { getUserById, updateUser, uploadImage, fetchRoles } = useNAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const isEditMode = userId !== undefined && userId > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<UserEditFormData>({
    resolver: zodResolver(
      isEditMode
        ? userEditSchema
        : userEditSchema.extend({
            password: z
              .string()
              .min(8, 'Password must be at least 8 characters')
              .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
              .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
              .regex(/[0-9]/, 'Password must contain at least one number'),
          })
    ),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      status: 1,
      isAdmin: false,
      birthDate: '',
      idDocument: '',
      pixKey: '',
      selectedRoleIds: [],
      phones: [],
      addresses: [],
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'phones',
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'addresses',
  });

  const selectedRoleIds = watch('selectedRoleIds');

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const roles = await fetchRoles();
        setAvailableRoles(roles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load roles';
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, [fetchRoles, onError]);

  // Load user data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadUser = async () => {
        setIsLoadingUser(true);
        setError(null);

        try {
          const user = await getUserById(userId);
          
          // Populate form fields
          setValue('name', user.name || '');
          setValue('email', user.email || '');
          setValue('status', user.status || 1);
          setValue('isAdmin', user.isAdmin || false);
          setValue('birthDate', user.birthDate ? user.birthDate.split('T')[0] : '');
          setValue('idDocument', user.idDocument || '');
          setValue('pixKey', user.pixKey || '');
          setValue('selectedRoleIds', user.roles?.map(r => r.roleId) || []);
          
          // Set image
          if (user.imageUrl) {
            setImageUrl(user.imageUrl);
            setImagePreview(user.imageUrl);
          }

          // Set phones
          if (user.phones && user.phones.length > 0) {
            setValue('phones', user.phones.map(p => ({ phone: p.phone })));
          }

          // Set addresses
          if (user.addresses && user.addresses.length > 0) {
            setValue('addresses', user.addresses.map(a => ({
              zipCode: a.zipCode,
              address: a.address,
              complement: a.complement || '',
              neighborhood: a.neighborhood,
              city: a.city,
              state: a.state,
            })));
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
          setError(errorMessage);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        } finally {
          setIsLoadingUser(false);
        }
      };

      loadUser();
    }
  }, [userId, isEditMode, setValue, onError, getUserById]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploadingImage(true);
    setError(null);

    try {
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      setImagePreview(null);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview(null);
  };

  const handleRoleToggle = (roleId: number) => {
    const currentRoles = selectedRoleIds || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    setValue('selectedRoleIds', newRoles);
  };

  const formatIdDocument = (value: string): string => {
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned.length <= 11) {
      // CPF: 123.456.789-01
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 12.345.678/0001-90
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const formatCEP = (value: string): string => {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  };

  const onSubmit = async (data: UserEditFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: Partial<UserInfo> = {
        userId: isEditMode ? userId : 0,
        slug: '',
        imageUrl: imageUrl,
        name: data.name,
        email: data.email,
        hash: '',
        isAdmin: data.isAdmin,
        birthDate: data.birthDate || '',
        idDocument: data.idDocument || '',
        pixKey: data.pixKey || '',
        password: isEditMode ? '' : data.password || '',
        status: data.status,
        roles: data.selectedRoleIds.map(roleId => ({
          roleId: roleId,
          slug: '',
          name: '',
        })),
        phones: data.phones?.map(p => ({ phone: p.phone.replace(/[^\d]/g, '') })) || [],
        addresses: data.addresses?.map(a => ({
          zipCode: a.zipCode.replace(/[^\d]/g, ''),
          address: a.address,
          complement: a.complement,
          neighborhood: a.neighborhood,
          city: a.city,
          state: a.state,
        })) || [],
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString(),
      };

      const result = await updateUser(payload);

      if (onSuccess) {
        onSuccess(result);
      }

      if (!isEditMode) {
        reset();
        setImageUrl('');
        setImagePreview(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : isEditMode ? 'Failed to update user' : 'Failed to create user';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleReset = () => {
    reset();
    setImageUrl('');
    setImagePreview(null);
    setError(null);
  };

  if (isLoadingUser || isLoadingRoles) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>

      {/* General Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Basic Information and User Image */}
      <div className="grid grid-cols-3 gap-6">
        {/* Basic Information - 2/3 */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Min 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <select
              id="status"
              {...register('status', { valueAsNumber: true })}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
              <option value={3}>Suspended</option>
              <option value={4}>Blocked</option>
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isAdmin"
              type="checkbox"
              {...register('isAdmin')}
              disabled={isLoading}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isAdmin" className="font-normal cursor-pointer">
              Is Administrator
            </Label>
          </div>
        </div>

        {/* User Image - 1/3 */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Image</h3>
          <div className="flex flex-col items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="User preview"
                  className="h-32 w-32 rounded-full object-cover border-2 border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                  disabled={uploadingImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="w-full">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImage || isLoading}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                Max 5MB, JPG or PNG
              </p>
            </div>
          </div>
          {uploadingImage && (
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            disabled={isLoading}
          />
          {errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idDocument">ID Document (CPF/CNPJ)</Label>
          <Input
            id="idDocument"
            placeholder="123.456.789-01"
            {...register('idDocument')}
            onChange={(e) => {
              const formatted = formatIdDocument(e.target.value);
              e.target.value = formatted;
            }}
            disabled={isLoading}
            maxLength={18}
          />
          {errors.idDocument && (
            <p className="text-sm text-destructive">{errors.idDocument.message}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Brazilian CPF (11 digits) or CNPJ (14 digits)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixKey">PIX Key</Label>
          <Input
            id="pixKey"
            placeholder="john.doe@example.com or phone"
            {...register('pixKey')}
            disabled={isLoading}
          />
          {errors.pixKey && (
            <p className="text-sm text-destructive">{errors.pixKey.message}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Email, phone, CPF, or random PIX key
          </p>
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Roles <span className="text-destructive">*</span>
        </h3>
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <div key={role.roleId} className="flex items-center space-x-2">
              <input
                id={`role-${role.roleId}`}
                type="checkbox"
                checked={selectedRoleIds?.includes(role.roleId)}
                onChange={() => handleRoleToggle(role.roleId)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-input"
              />
              <Label
                htmlFor={`role-${role.roleId}`}
                className="font-normal cursor-pointer"
              >
                {role.name}
              </Label>
            </div>
          ))}
        </div>
        {errors.selectedRoleIds && (
          <p className="text-sm text-destructive">{errors.selectedRoleIds.message}</p>
        )}
      </div>

      {/* Phone Numbers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Phone Numbers</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPhone({ phone: '' })}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Phone
          </Button>
        </div>

        {phoneFields.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">No phone numbers added</p>
        )}

        {phoneFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`phone-${index}`} className="text-gray-700 dark:text-gray-300">Phone {index + 1}</Label>
              <Input
                id={`phone-${index}`}
                placeholder="(11) 99999-9999"
                {...register(`phones.${index}.phone`)}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  e.target.value = formatted;
                }}
                disabled={isLoading}
                maxLength={15}
              />
              {errors.phones?.[index]?.phone && (
                <p className="text-sm text-destructive">
                  {errors.phones[index]?.phone?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removePhone(index)}
              disabled={isLoading}
              className="mt-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Addresses</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendAddress({
                zipCode: '',
                address: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
              })
            }
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Address
          </Button>
        </div>

        {addressFields.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">No addresses added</p>
        )}

        {addressFields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MapPin className="h-4 w-4" />
                Address {index + 1}
              </h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeAddress(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`address-${index}-zipCode`}>Zip Code</Label>
                <Input
                  id={`address-${index}-zipCode`}
                  placeholder="12345-678"
                  {...register(`addresses.${index}.zipCode`)}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    e.target.value = formatted;
                  }}
                  disabled={isLoading}
                  maxLength={9}
                />
                {errors.addresses?.[index]?.zipCode && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.zipCode?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address-${index}-state`}>State</Label>
                <select
                  id={`address-${index}-state`}
                  {...register(`addresses.${index}.state`)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select state</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.addresses?.[index]?.state && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.state?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`address-${index}-address`}>Address</Label>
              <Input
                id={`address-${index}-address`}
                placeholder="123 Main Street"
                {...register(`addresses.${index}.address`)}
                disabled={isLoading}
              />
              {errors.addresses?.[index]?.address && (
                <p className="text-sm text-destructive">
                  {errors.addresses[index]?.address?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`address-${index}-complement`}>Complement</Label>
              <Input
                id={`address-${index}-complement`}
                placeholder="Apt 101"
                {...register(`addresses.${index}.complement`)}
                disabled={isLoading}
              />
              {errors.addresses?.[index]?.complement && (
                <p className="text-sm text-destructive">
                  {errors.addresses[index]?.complement?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`address-${index}-neighborhood`}>Neighborhood</Label>
                <Input
                  id={`address-${index}-neighborhood`}
                  placeholder="Downtown"
                  {...register(`addresses.${index}.neighborhood`)}
                  disabled={isLoading}
                />
                {errors.addresses?.[index]?.neighborhood && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.neighborhood?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address-${index}-city`}>City</Label>
                <Input
                  id={`address-${index}-city`}
                  placeholder="São Paulo"
                  {...register(`addresses.${index}.city`)}
                  disabled={isLoading}
                />
                {errors.addresses?.[index]?.city && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.city?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Required Fields Note */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="text-destructive">*</span> Required fields
      </p>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        {!isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        )}

        <Button type="submit" disabled={isLoading || uploadingImage}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};
