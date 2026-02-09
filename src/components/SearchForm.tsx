import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { SearchFormProps, UserInfo, PagedResult } from '../types';
import { cn } from '../utils/cn';
import { useNAuth } from '../contexts/NAuthContext';

const STATUS_LABELS: Record<number, string> = {
  1: 'Active',
  2: 'Inactive',
  3: 'Suspended',
  4: 'Blocked',
};

const STATUS_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  2: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  3: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  4: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const SearchForm: React.FC<SearchFormProps> = ({
  onSuccess,
  onError,
  onUserClick,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showUserAvatar = true,
  className,
  styles = {},
}) => {
  const {searchUsers} = useNAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PagedResult<UserInfo> | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search term changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchResult = await searchUsers({
        searchTerm: debouncedSearchTerm,
        page,
        pageSize,
      });

      setResult(searchResult);

      if (onSuccess) {
        onSuccess(searchResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchUsers, debouncedSearchTerm, page, pageSize, onSuccess, onError]);

  // Perform search when dependencies change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handlePreviousPage = () => {
    if (result?.hasPreviousPage) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (result?.hasNextPage) {
      setPage(page + 1);
    }
  };

  const handleUserRowClick = (user: UserInfo) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  const getStatusBadge = (status?: number) => {
    if (!status) return null;
    
    const label = STATUS_LABELS[status] || 'Unknown';
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS[2];

    return (
      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', colorClass)}>
        {label}
      </span>
    );
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('space-y-6', styles.container, className)}>
      {/* Search Bar */}
      <div className={cn('space-y-2', styles.searchBar)}>
        <Label htmlFor="search">Search Users</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-4">
        <Label htmlFor="pageSize" className="whitespace-nowrap">Items per page:</Label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700"
          disabled={isLoading}
        >
          {pageSizeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={performSearch}>
            Retry
          </Button>
        </div>
      )}

      {/* Results Table */}
      {!isLoading && !error && result && (
        <>
          <div className={cn('border rounded-lg overflow-hidden', styles.table)}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    {showUserAvatar && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avatar
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Roles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {result.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showUserAvatar ? 5 : 4}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        No users found. Try a different search term.
                      </td>
                    </tr>
                  ) : (
                    result.items.map((user) => (
                      <tr
                        key={user.userId}
                        onClick={() => handleUserRowClick(user)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        {showUserAvatar && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {getUserInitials(user.name)}
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                              </div>
                              {user.isAdmin && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role.roleId}
                                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                                >
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">No roles</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className={cn('flex items-center justify-between', styles.pagination)}>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {result.items.length > 0 ? ((page - 1) * pageSize + 1) : 0} to{' '}
              {Math.min(page * pageSize, result.totalCount)} of {result.totalCount} users
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {result.totalPages || 1}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!result.hasPreviousPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!result.hasNextPage || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
