'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Shield,
  Baby,
  Users,
  UserCheck,
  Building2,
  GraduationCap,
  Package,
  ShoppingCart,
  Receipt,
  Utensils,
  HeartPulse,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { exportToExcelFile, exportToCSVFile } from '@/lib/export';

export function ReportsManagement() {
  const [selectedReport, setSelectedReport] = useState('CHILDREN');
  const [reportTitle, setReportTitle] = useState('Resident Children Official Roster & Dossier');
  const [reportData, setReportData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const reportOptions = [
    { id: 'CHILDREN', name: '1. Children Directory & Dossiers', icon: Baby, desc: 'Complete biometrics, B-form, hostel beds, classes, and care assignments' },
    { id: 'STAFF', name: '2. Staff Force Directory (23 Posts)', icon: Users, desc: 'All 23 sanctioned institutional positions, roles, and contacts' },
    { id: 'ATTENDANCE', name: '3. Attendance Register', icon: UserCheck, desc: 'Daily and monthly attendance records for children and duty staff' },
    { id: 'HOSTEL', name: '4. Hostel Occupancy & Beds', icon: Building2, desc: '64 beds capacity audit across Block A and Junior Block B' },
    { id: 'EDUCATION', name: '5. Academic Exam Results', icon: GraduationCap, desc: 'Formal schooling progress, marks obtained, and term grades' },
    { id: 'INVENTORY', name: '6. Inventory Stock Ledger', icon: Package, desc: 'Live balances across food, kitchen, cleaning, uniform, and medicine stores' },
    { id: 'RATION', name: '7. Food & Ration Report', icon: Package, desc: 'Grains, oils, pulses, sugar, milk, and seasonal food stocks' },
    { id: 'LOW_STOCK', name: '8. Low-Stock & Reorder Alerts', icon: AlertTriangle, desc: 'Items currently below minimum sanctioned threshold' },
    { id: 'PURCHASES', name: '9. Procurement & Purchase Orders', icon: ShoppingCart, desc: 'Supplier procurement invoices and stock addition logs' },
    { id: 'EXPENSES', name: '10. Institutional Expenditure', icon: Receipt, desc: 'Vouchers, utilities, food bills, repairs, and care costs' },
    { id: 'KITCHEN', name: '11. Kitchen Meal Consumption', icon: Utensils, desc: 'Daily meal preparations and total heads served' },
    { id: 'MEDICAL', name: '12. Child Medical & Health Log', icon: HeartPulse, desc: 'Doctor clinical visits, diagnoses, vitals, and prescriptions' },
    { id: 'MONTHLY', name: '13. Monthly Financial Statement', icon: DollarSign, desc: 'Government grants, expenditures, and NBP bank balance' },
    { id: 'YEARLY', name: '14. Annual Institutional Audit', icon: FileBarChart, desc: 'Fiscal year operations, admissions, inventory, and expenditures' },
  ];

  const fetchReport = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data || []);
        setReportTitle(data.title || 'Official Institutional Report');
      }
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedReport);
  }, [selectedReport]);

  const handleSelectReport = (type: string) => {
    setSelectedReport(type);
    setSearch('');
  };

  const filteredData = reportData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  const handleExportExcel = () => {
    exportToExcelFile(filteredData, `Sweet_Home_Multan_${selectedReport}_Report`);
  };

  const handleExportCSV = () => {
    exportToCSVFile(filteredData, `Sweet_Home_Multan_${selectedReport}_Report`);
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Reports & Audit Center</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              14 Official Reports
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pakistan Bait-ul-Maal compliance reporting with live database queries, Excel export, and printable formats.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Document</span>
          </button>
        </div>
      </div>

      {/* Reports Catalog Grid (Hidden when printing) */}
      <div className="no-print">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Institutional Report:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-100/70 rounded-xl border border-slate-200">
          {reportOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedReport === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectReport(opt.id)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-700'}`} />
                <span className="truncate">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Institutional Document Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 print-container">
        
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-emerald-800 pb-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-7 h-7 text-emerald-800" />
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              PAKISTAN BAIT-UL-MAAL
            </h2>
          </div>
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
            SWEET HOME MULTAN • INSTITUTIONAL AUDIT & OPERATIONS REPORT
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Near Eidgah, LMQ Road, Multan, Punjab, Pakistan | Head Office Reference Registry
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700">
            <span className="font-bold text-slate-900">{reportTitle}</span>
            <span>Generated on: {todayStr}</span>
          </div>
        </div>

        {/* Search within Report (No Print) */}
        <div className="flex justify-between items-center mb-4 no-print">
          <span className="text-xs font-bold text-slate-600">
            Showing {filteredData.length} Records
          </span>
          <div className="w-64 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-4 py-10 text-center text-slate-400">
                    Compiling official report data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-4 py-10 text-center text-slate-400">
                    No data records available for this report type.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2.5 text-slate-700 whitespace-nowrap font-medium">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section (Visible in Print & Screen) */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Prepared & Verified By
            </div>
            <div className="text-[10px] text-slate-500">Account Assistant / Clerk</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Checked & Audited By
            </div>
            <div className="text-[10px] text-slate-500">HR Representative / Admin</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-emerald-950">
              Approved & Counter-Signed
            </div>
            <div className="text-[10px] text-slate-500">Incharge Sweet Home Multan</div>
          </div>
        </div>

      </div>
    </div>
  );
}
