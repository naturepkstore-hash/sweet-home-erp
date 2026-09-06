'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Baby, FileText, UserCheck, GraduationCap, Building2, PlusCircle, ArrowRight } from 'lucide-react';
import { Role } from '@prisma/client';

interface HRClerkDashboardProps {
  user: {
    id: string;
    fullName: string;
    role: Role;
  };
  totalStaff: number;
  totalChildren: number;
  recentRecords: {
    id: string;
    name: string;
    code: string;
    type: string;
  }[];
}

export function HRClerkDashboard({ user, totalStaff, totalChildren, recentRecords }: HRClerkDashboardProps) {
  const isHR = user.role === Role.HR_REPRESENTATIVE;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <span>{isHR ? 'Human Resources & Staff Administration' : 'Admissions & Student Records Registry'}</span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isHR
                ? 'Managing 23 institutional staff profiles, duty rosters, daily attendance, and personnel records.'
                : 'Managing children enrollment, B-Form verification, document archives, education tracking, and hostel assignments.'}
            </p>
          </div>

          <div className="flex gap-3">
            {isHR ? (
              <Link
                href="/staff"
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Staff Directory</span>
              </Link>
            ) : (
              <Link
                href="/children?action=new"
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Child Admission</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isHR ? 'Active Staff Strength' : 'Enrolled Children'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {isHR ? `${totalStaff} / 23` : totalChildren}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {isHR ? 'All Sanctioned Posts Active' : 'Resident in Sweet Home'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            {isHR ? <Users className="w-6 h-6" /> : <Baby className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Module
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              100%
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Daily Record System
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isHR ? 'HR Reports Center' : 'Academic & Hostel Archive'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              Verified
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Official Institutional Data
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            {isHR ? <FileText className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">
            {isHR ? 'Staff & Duty Modules' : 'Children & Student Modules'}
          </h2>
          <div className="mt-4 space-y-2">
            {isHR ? (
              <>
                <Link
                  href="/staff"
                  className="p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-between transition-all"
                >
                  <div className="font-semibold text-slate-800">Complete Employee Profiles & Credentials</div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>
                <Link
                  href="/attendance"
                  className="p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-between transition-all"
                >
                  <div className="font-semibold text-slate-800">Staff Daily & Monthly Attendance Matrix</div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/children"
                  className="p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-between transition-all"
                >
                  <div className="font-semibold text-slate-800">Children Directory & Admission Files</div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>
                <Link
                  href="/hostel"
                  className="p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-between transition-all"
                >
                  <div className="font-semibold text-slate-800">Hostel Room & Bed Allocations</div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>
                <Link
                  href="/education"
                  className="p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs flex items-center justify-between transition-all"
                >
                  <div className="font-semibold text-slate-800">Academic Classes & Exam Results</div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">
              Official Documentation & Reporting
            </h2>
            <p className="text-xs text-slate-500 mt-3">
              Generate standardized institutional records formatted with official Pakistan Bait-ul-Maal Sweet Home headers, printable dossiers, and exportable Excel files.
            </p>
          </div>
          <Link
            href="/reports"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg text-center shadow-xs transition-all mt-4 block"
          >
            Access Reports Center
          </Link>
        </div>
      </div>
    </div>
  );
}
