import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit, Plus, Loader2, Search, AlertCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { useNAuthTranslation } from '../i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { RoleListProps, RoleInfo } from '../types';
import { cn } from '../utils/cn';

export const RoleList: React.FC<RoleListProps> = ({
    onRoleClick,
    onEdit,
    onDelete,
    onSuccess,
    onError,
    showCreateButton = true,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    className,
    styles = {},
}) => {
    const { user, fetchRoles: fetchRolesAPI, deleteRole: deleteRoleAPI } = useNAuth();
    const { t } = useNAuthTranslation();
    const [roles, setRoles] = useState<RoleInfo[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<RoleInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleInfo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRoles = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchRolesAPI();
            setRoles(data);
            setFilteredRoles(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
            setError(errorMessage);
            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = roles.filter(
                (role) =>
                    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    role.slug.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRoles(filtered);
            setCurrentPage(1);
        } else {
            setFilteredRoles(roles);
        }
    }, [searchTerm, roles]);

    const { paginatedRoles, totalPages, hasPreviousPage, hasNextPage } = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = filteredRoles.slice(startIndex, endIndex);
        const total = Math.ceil(filteredRoles.length / pageSize);

        return {
            paginatedRoles: items,
            totalPages: total,
            hasPreviousPage: currentPage > 1,
            hasNextPage: currentPage < total,
        };
    }, [filteredRoles, currentPage, pageSize]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePreviousPage = () => {
        if (hasPreviousPage) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const confirmDelete = (role: RoleInfo) => {
        setRoleToDelete(role);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setRoleToDelete(null);
        setShowDeleteConfirm(false);
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            await deleteRoleAPI(roleToDelete.roleId);
            await fetchRoles();

            if (onDelete) {
                onDelete(roleToDelete);
            }

            if (onSuccess) {
                onSuccess();
            }

            setShowDeleteConfirm(false);
            setRoleToDelete(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
            setError(errorMessage);
            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage));
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditRole = (role: RoleInfo) => {
        if (onEdit) {
            onEdit(role);
        }
    };

    const handleRoleClick = (role: RoleInfo) => {
        if (onRoleClick) {
            onRoleClick(role);
        }
    };

    const isAdmin = user?.isAdmin ?? false;

    if (!isAdmin) {
        return (
            <div className={cn('flex items-center gap-2 text-red-400', className)}>
                <AlertCircle size={20} />
                <p>{t('roles.permissionDeniedView')}</p>
            </div>
        );
    }

    return (
        <>
            {/* Header with Search and Create Button */}
            <div className={cn('flex items-center gap-4', styles.searchBar)}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        type="text"
                        placeholder={t('roles.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
                {showCreateButton && (
                    <Button
                        onClick={() => onEdit && onEdit({ roleId: 0, name: '', slug: '' })}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <Plus size={16} />
                        {t('roles.createRole')}
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-muted-foreground" size={32} />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className={cn('border rounded-lg overflow-hidden', styles.table)}>
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-semibold">{t('common.id')}</th>
                                    <th className="text-left p-4 font-semibold">{t('common.name')}</th>
                                    <th className="text-left p-4 font-semibold">{t('common.slug')}</th>
                                    <th className="text-right p-4 font-semibold">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                                            {searchTerm ? t('roles.noRolesFound') : t('roles.noRolesAvailable')}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRoles.map((role) => (
                                        <tr
                                            key={role.roleId}
                                            className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => handleRoleClick(role)}
                                        >
                                            <td className="p-4 text-gray-300">{role.roleId}</td>
                                            <td className="p-4 font-medium text-gray-100">{role.name}</td>
                                            <td className="p-4 text-gray-400">{role.slug}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditRole(role);
                                                        }}
                                                        className="flex items-center gap-1 bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-white"
                                                    >
                                                        <Edit size={14} />
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(role);
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Trash2 size={14} />
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginatedRoles.length > 0 && (
                        <div className={cn('flex items-center justify-between', styles.pagination)}>
                            <div className="flex items-center gap-2 text-sm text-gray-200">
                                <span>
                                    {t('common.showingRange', {
                                        from: (currentPage - 1) * pageSize + 1,
                                        to: Math.min(currentPage * pageSize, filteredRoles.length),
                                        total: filteredRoles.length,
                                    })}
                                </span>
                                <span className="mx-2">|</span>
                                <Label htmlFor="pageSize" className="text-sm text-gray-200">
                                    {t('common.itemsPerPage')}
                                </Label>
                                <select
                                    id="pageSize"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="border rounded px-2 py-1 bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    {pageSizeOptions.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={!hasPreviousPage}
                                    className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700"
                                >
                                    {t('common.previous')}
                                </Button>
                                <span className="text-sm text-gray-300">
                                    {t('common.pageOf', { page: currentPage, totalPages })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={!hasNextPage}
                                    className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700"
                                >
                                    {t('common.next')}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && roleToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg border shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">{t('roles.confirmDelete')}</h3>
                        <p
                            className="text-muted-foreground mb-6"
                            dangerouslySetInnerHTML={{
                                __html: t('roles.confirmDeleteMessage', { name: roleToDelete.name }),
                            }}
                        />
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteRole}
                                disabled={isDeleting}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 className="animate-spin" size={16} />}
                                {t('common.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
