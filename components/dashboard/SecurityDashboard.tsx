'use client';

import React, { useState } from 'react';
import { Shield, UserPlus, CheckCircle2, Clock, PhoneCall, AlertOctagon } from 'lucide-react';
import { EmployeeDutyAssignments } from './EmployeeDutyAssignments';

interface SecurityDashboardProps {
  user: {
    id: string;
    fullName: string;
  };
}

export function SecurityDashboard({ user }: SecurityDashboardProps) {
  const [visitors, setVisitors] = useState([
    {
      id: 1,
      name: 'Muhammad Tariq',
      cnic: '36302-1122334-1',
      purpose: 'Official Inspection from PBM Regional Office',
      timeIn: '10:30 AM',
      timeOut: '12:15 PM',
      status: 'CHECKED_OUT',
    },
    {
      id: 2,
      name: 'Dr. Salman Haider',
      cnic: '36302-8877665-3',
      purpose: 'Routine Medical Checkup of Hostel Children',
      timeIn: '02:00 PM',
      timeOut: '-',
      status: 'INSIDE_CAMPUS',
    },
    {
      id: 3,
      name: 'Haji Asghar (Supplier)',
      cnic: '36302-5544332-1',
      purpose: 'Ration Delivery (Flour & Rice bags)',
      timeIn: '03:15 PM',
      timeOut: '-',
      status: 'INSIDE_CAMPUS',
    },
  ]);

  const [vName, setVName] = useState('');
  const [vCnic, setVCnic] = useState('');
  const [vPurpose, setVPurpose] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vCnic) return;

    const newV = {
      id: visitors.length + 1,
      name: vName,
      cnic: vCnic,
      purpose: vPurpose || 'Official Visit',
      timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOut: '-',
      status: 'INSIDE_CAMPUS',
    };

    setVisitors([newV, ...visitors]);
    setVName('');
    setVCnic('');
    setVPurpose('');
    setVPhone('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleCheckout = (id: number) => {
    setVisitors(
      visitors.map((v) =>
        v.id === id
          ? {
              ...v,
              timeOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'CHECKED_OUT',
            }
          : v
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sweet Home Multan • Main Gate Security Command</span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              24/7 Campus perimeter security, strict visitor authorization, gate register logging, and emergency protocol dispatch.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center min-w-[150px]">
            <div className="text-2xl font-extrabold text-emerald-400">GATE 1</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Active Perimeter Guard</div>
          </div>
        </div>
      </div>

      <EmployeeDutyAssignments />

      {/* Grid: New Entry Form + Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visitor Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">Log New Campus Gate Entry</h2>
          </div>

          {success && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Visitor entry recorded in official gate register!</span>
            </div>
          )}

          <form onSubmit={handleAddVisitor} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Asghar"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC / ID Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="36302-XXXXXXX-X"
                  value={vCnic}
                  onChange={(e) => setVCnic(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="0300-XXXXXXX"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Official Meeting with Incharge"
                  value={vPurpose}
                  onChange={(e) => setVPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
            >
              Record Entry & Issue Visitor Pass
            </button>
          </form>
        </div>

        {/* Emergency Helpline Contacts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PhoneCall className="w-5 h-5 text-red-600" />
              <h2 className="text-sm font-bold text-slate-800">Emergency Quick Contacts</h2>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                <div className="font-bold text-red-900">Rescue 1122 (Ambulance / Fire)</div>
                <div className="text-red-700 text-[11px] font-semibold">Dial 1122</div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-bold text-blue-900">Cantt Police Station Multan</div>
                <div className="text-blue-700 text-[11px] font-semibold">061-9200115 / 15</div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="font-bold text-emerald-900">Incharge Sweet Home Control</div>
                <div className="text-emerald-700 text-[11px] font-semibold">0300-7301122</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Log all unusual incidents immediately
          </div>
        </div>

      </div>

      {/* Live Gate Visitor Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Today's Gate Visitor Register</h2>
            <p className="text-xs text-slate-500">Real-time tracking of visitors inside Sweet Home Multan premises</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {visitors.filter((v) => v.status === 'INSIDE_CAMPUS').length} Active Visitors Inside
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Visitor Name</th>
                <th className="px-4 py-3">CNIC</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Time In</th>
                <th className="px-4 py-3">Time Out</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900">{v.name}</td>
                  <td className="px-4 py-3 text-slate-600">{v.cnic}</td>
                  <td className="px-4 py-3 text-slate-700">{v.purpose}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{v.timeIn}</td>
                  <td className="px-4 py-3 text-slate-500">{v.timeOut}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'INSIDE_CAMPUS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.status === 'INSIDE_CAMPUS' ? 'Inside Campus' : 'Checked Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.status === 'INSIDE_CAMPUS' ? (
                      <button
                        onClick={() => handleCheckout(v.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        Mark Exit
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
