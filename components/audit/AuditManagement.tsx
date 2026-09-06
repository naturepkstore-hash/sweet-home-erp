'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDateTime } from '@/lib/utils';

interface AuditLogItem {
  id: string;
  userEmail: string;
  action: string;
  module: string;
  recordId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export function AuditManagement() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (moduleFilter !== 'ALL') query.append('module', moduleFilter);
      if (actionFilter !== 'ALL') query.append('action', actionFilter);

      const res = await fetch(`/api/audit?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter, actionFilter]);

  const exportExcel = () => {
    const exportData = logs.map((l, idx) => ({
      'Sr #': idx + 1,
      'Timestamp': formatDateTime(l.createdAt),
      'User Email': l.userEmail,
      'Action': l.action,
      'ERP Module': l.module,
      'Record ID': l.recordId || '-',
      'Detailed Log': l.details || '-',
      'IP Address': l.ipAddress || '127.0.0.1',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Audit_Trail');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Security & Audit Trail</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete tamper-proof logging of logins, admissions, stock adjustments, financial transactions, and permission changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, action, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Modules</option>
              <option value="AUTH">AUTH</option>
              <option value="CHILDREN">CHILDREN</option>
              <option value="STAFF">STAFF</option>
              <option value="ATTENDANCE">ATTENDANCE</option>
              <option value="HOSTEL">HOSTEL</option>
              <option value="EDUCATION">EDUCATION</option>
              <option value="INVENTORY">INVENTORY</option>
              <option value="MESS">MESS</option>
              <option value="MEDICAL">MEDICAL</option>
              <option value="FINANCE">FINANCE</option>
              <option value="PURCHASES">PURCHASES</option>
              <option value="SETTINGS">SETTINGS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="ADMIT_CHILD">ADMIT_CHILD</option>
              <option value="CREATE_EMPLOYEE">CREATE_EMPLOYEE</option>
              <option value="UPDATE_EMPLOYEE">UPDATE_EMPLOYEE</option>
              <option value="RECORD_ATTENDANCE">RECORD_ATTENDANCE</option>
              <option value="STOCK_TRANSACTION">STOCK_TRANSACTION</option>
              <option value="RECORD_PURCHASE">RECORD_PURCHASE</option>
              <option value="RECORD_FINANCE_TXN">RECORD_FINANCE_TXN</option>
              <option value="UPDATE_MENU">UPDATE_MENU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Activity Description</th>
                <th className="px-4 py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{log.userEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-800">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md font-medium">
                      {log.details || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-right font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
