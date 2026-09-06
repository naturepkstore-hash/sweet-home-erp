'use client';

import React, { useState } from 'react';
import { Utensils, Sparkles, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { Role } from '@prisma/client';

interface ServiceStaffDashboardProps {
  user: {
    id: string;
    fullName: string;
    role: Role;
    department: string;
  };
}

export function ServiceStaffDashboard({ user }: ServiceStaffDashboardProps) {
  // Tailor duties based on role
  const isWaiter = user.role === Role.WAITER;
  const isHelper = user.role === Role.COOK_HELPER;
  const isSweeper = user.role === Role.SWEEPER;

  const defaultChecklist = isWaiter
    ? [
        { id: 1, text: 'Dining Hall Cleanliness & Table Setup before Breakfast', done: true },
        { id: 2, text: 'Serving Breakfast to 80+ Children & Ensuring Disciplined Queue', done: true },
        { id: 3, text: 'Lunch Table Layout, Water Jugs & Bread Basket Placement', done: false },
        { id: 4, text: 'Lunch Food Distribution & Table Cleaning', done: false },
        { id: 5, text: 'Evening Tea & Dinner Table Readiness', done: false },
        { id: 6, text: 'Dinner Meal Service & Night Dining Hall Mopping', done: false },
      ]
    : isHelper
    ? [
        { id: 1, text: 'Morning Flour Kneading (Atta) & Tandoor Ignition', done: true },
        { id: 2, text: 'Breakfast Utensil Washing & Kitchen Surface Sanitization', done: true },
        { id: 3, text: 'Vegetable Peeling, Chopping & Meat Prep for Lunch', done: false },
        { id: 4, text: 'Stock Stacking & Ration Bags Retrieval from Store', done: false },
        { id: 5, text: 'Dinner Prep & Cooking Utensil Deep Cleaning', done: false },
      ]
    : [
        { id: 1, text: 'Hostel Block A Corridors & Staircase Mopping with Phenyl', done: true },
        { id: 2, text: 'Hostel Bathrooms & Washrooms Deep Scrubbing & Disinfection', done: true },
        { id: 3, text: 'Main Dining Hall & Kitchen Surrounds Cleaning', done: false },
        { id: 4, text: 'Campus Compound & Front Lawns Litter Sweep', done: false },
        { id: 5, text: 'Evening Trash Bin Emptying & Waste Disposal to Municipal Bin', done: false },
      ];

  const [checklist, setChecklist] = useState(defaultChecklist);
  const [logNotes, setLogNotes] = useState('');
  const [logSubmitted, setLogSubmitted] = useState(false);

  const toggleCheck = (id: number) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const handleSaveDutyLog = (e: React.FormEvent) => {
    e.preventDefault();
    setLogSubmitted(true);
    setTimeout(() => setLogSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {isWaiter ? 'Dining & Mess Service Station' : isHelper ? 'Kitchen Assistance Station' : 'Campus Sanitation Station'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isWaiter
                ? 'Responsible for dining hall readiness, food distribution, and meal service.'
                : isHelper
                ? 'Assisting head cooks, food prep, dishwashing, and kitchen sanitation.'
                : 'Responsible for institutional hygiene, washroom sanitation, and hostel cleanliness.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center min-w-[150px]">
            <div className="text-xs text-slate-300 font-medium">Duty Status</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">ON ACTIVE DUTY</div>
          </div>
        </div>
      </div>

      {/* Duty Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-800">Daily Task Checklist & Duty Log</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {checklist.filter((c) => c.done).length} / {checklist.length} Completed
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                  item.done
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className={`font-medium ${item.done ? 'line-through text-slate-500' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Note & Handover */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Shift Handover & Remarks</h2>
            </div>

            {logSubmitted && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Shift log submitted successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveDutyLog} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Remarks / Equipment Issues</label>
                <textarea
                  rows={4}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. Completed morning dining service. Need 2 additional mop refills from store."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
              >
                Submit Shift Duty Log
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Supervised by Administrative Incharge
          </div>
        </div>
      </div>
    </div>
  );
}
