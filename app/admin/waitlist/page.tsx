'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortConfig>({ key: 'joinedDate', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({ status: 'all', search: '' });
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Fetch waitlist entries from API
  useEffect(() => {
    const fetchWaitlistEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/waitlist');
        
        if (!response.ok) {
          throw new Error('Failed to fetch waitlist entries');
        }
        
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        console.error('Error fetching waitlist entries:', err);
        setError('Failed to load waitlist entries. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWaitlistEntries();
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
    if (selectedEntries.size === 0) return;
    
    try {
      const ids = Array.from(selectedEntries);
      
      const response = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids,
          status,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update entries');
      }
      
      // Update local state
      setEntries(prev =>
        prev.map(entry =>
          selectedEntries.has(entry.id) ? { ...entry, status } : entry
        )
      );
      
      // Clear selection
      setSelectedEntries(new Set());
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleDeleteEntries = async () => {
    if (selectedEntries.size === 0) return;
    
    if (!confirm('Are you sure you want to delete the selected entries?')) return;
    
    try {
      const ids = Array.from(selectedEntries);
      
      const response = await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entries');
      }
      
      // Update local state
      setEntries(prev => prev.filter(entry => !selectedEntries.has(entry.id)));
      
      // Clear selection
      setSelectedEntries(new Set());
    } catch (err) {
      console.error('Error deleting entries:', err);
      setError('Failed to delete entries. Please try again.');
    }
  };

  const handleSendBulkEmail = async () => {
    if (selectedEntries.size === 0 || !emailSubject.trim() || !emailMessage.trim()) {
      return;
    }
    
    try {
      setSendingEmail(true);
      
      const response = await fetch('/api/waitlist/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedEntries),
          subject: emailSubject,
          message: emailMessage,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send emails');
      }
      
      const result = await response.json();
      
      setEmailSuccess(`Successfully sent ${result.sent} emails. ${result.failed > 0 ? `Failed to send ${result.failed} emails.` : ''}`);
      setEmailSubject('');
      setEmailMessage('');
      setShowEmailModal(false);
      setSelectedEntries(new Set());
    } catch (err) {
      console.error('Error sending bulk email:', err);
      setError('Failed to send bulk email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Email Modal Component
  const EmailModal = () => {
    const modalRef = useRef<HTMLDivElement>(null);
    
    // Close modal when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setShowEmailModal(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Send Email to Selected Subscribers</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Sending to {selectedEntries.size} recipient{selectedEntries.size !== 1 ? 's' : ''}
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="emailSubject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                placeholder="Enter email subject"
              />
            </div>
            
            <div>
              <label htmlFor="emailMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                id="emailMessage"
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                placeholder="Enter email message"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={sendingEmail}
            >
              Cancel
            </button>
            <button
              onClick={handleSendBulkEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    );
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
              onClick={() => setShowEmailModal(true)}
              disabled={selectedEntries.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              Send Email
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

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {emailSuccess && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-200 px-4 py-3 rounded-md mb-6">
            {emailSuccess}
          </div>
        )}

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

          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {entries.length === 0 ? 'No waitlist entries found.' : 'No entries match your filter criteria.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEntries.size > 0 && selectedEntries.size === filteredEntries.length}
                          onChange={e => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('fullName')}
                    >
                      Name {sort.key === 'fullName' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      Email {sort.key === 'email' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('joinedDate')}
                    >
                      Joined Date {sort.key === 'joinedDate' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status {sort.key === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEntries.has(entry.id)}
                          onChange={e => handleSelectEntry(entry.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{entry.fullName}</div>
                        {entry.phoneNumber && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{entry.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.joinedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                          entry.status === 'notified' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        }`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Displaying {filteredEntries.length} out of {entries.length} entries
        </div>
      </div>
      
      {showEmailModal && <EmailModal />}
    </div>
  );
} 