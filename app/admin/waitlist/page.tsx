'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import type { WaitlistEntry } from '../../lib/types';

interface SortConfig {
  key: keyof WaitlistEntry;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: string;
  search: string;
}

export default function WaitlistAdminPage() {
  const { userProfile } = useUser();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig>({ key: 'joinedDate', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({ status: 'all', search: '' });
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Simulated data for development
  useEffect(() => {
    const mockData: WaitlistEntry[] = [
      {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        joinedDate: '2024-03-15T10:30:00Z',
        status: 'pending',
        preferredLanguage: 'Spanish',
      },
      // Add more mock entries as needed
    ];
    setEntries(mockData);
    setLoading(false);
  }, []);

  // Check if user has admin access
  if (!userProfile?.id || userProfile?.settings?.privacyMode !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleSort = (key: keyof WaitlistEntry) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilter = (filterUpdate: Partial<FilterConfig>) => {
    setFilters(prev => ({ ...prev, ...filterUpdate }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(new Set(filteredEntries.map(entry => entry.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  const handleSelectEntry = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedEntries);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedEntries(newSelected);
  };

  const handleUpdateStatus = async (status: WaitlistEntry['status']) => {
    // TODO: Implement API call to update status
    setEntries(prev =>
      prev.map(entry =>
        selectedEntries.has(entry.id) ? { ...entry, status } : entry
      )
    );
    setSelectedEntries(new Set());
  };

  const handleDeleteEntries = async () => {
    if (!confirm('Are you sure you want to delete the selected entries?')) return;
    // TODO: Implement API call to delete entries
    setEntries(prev => prev.filter(entry => !selectedEntries.has(entry.id)));
    setSelectedEntries(new Set());
  };

  // Apply filters and sorting
  const filteredEntries = entries
    .filter(entry => {
      if (filters.status !== 'all' && entry.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          entry.fullName.toLowerCase().includes(searchLower) ||
          entry.email.toLowerCase().includes(searchLower) ||
          entry.phoneNumber?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = String(a[sort.key] || '');
      const bValue = String(b[sort.key] || '');
      const modifier = sort.direction === 'asc' ? 1 : -1;
      return aValue.localeCompare(bValue) * modifier;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Waitlist Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus('notified')}
              disabled={selectedEntries.size === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
            >
              Mark as Notified
            </button>
            <button
              onClick={() => handleUpdateStatus('registered')}
              disabled={selectedEntries.size === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              Mark as Registered
            </button>
            <button
              onClick={handleDeleteEntries}
              disabled={selectedEntries.size === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={filters.search}
                  onChange={e => handleFilter({ search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
              <select
                value={filters.status}
                onChange={e => handleFilter({ status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="notified">Notified</option>
                <option value="registered">Registered</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEntries.size === filteredEntries.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('fullName')}
                  >
                    Name
                    {sort.key === 'fullName' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {sort.key === 'email' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('joinedDate')}
                  >
                    Joined Date
                    {sort.key === 'joinedDate' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sort.key === 'status' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={e => handleSelectEntry(entry.id, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">{entry.fullName}</td>
                    <td className="px-4 py-3">{entry.email}</td>
                    <td className="px-4 py-3">{entry.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(entry.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === 'registered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : entry.status === 'notified'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 