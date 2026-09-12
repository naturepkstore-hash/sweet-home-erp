'use client';

import React, { useEffect, useState } from 'react';
import { Utensils, Sparkles, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { Role } from '@prisma/client';

interface ServiceStaffDashboardProps {
  user: {
    id: string;
    fullName: string;
    role: Role;
    department: string;
    employeeId?: string;
  };
}

interface DutyChecklistItem {
  id: string | number;
  text: string;
  urdu?: string;
  done: boolean;
  assignmentId?: string;
}

export function ServiceStaffDashboard({ user }: ServiceStaffDashboardProps) {
  // Tailor duties based on role
  const isWaiter = user.role === Role.WAITER;
  const isHelper = user.role === Role.COOK_HELPER;
  const isSweeper = user.role === Role.SWEEPER;
  const isDriver = user.role === Role.DRIVER;
  const isQari = user.role === Role.QARI_QARIA;

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
    : isDriver
    ? [
        { id: 1, text: 'Vehicle Safety Check and Fuel Verification', done: true },
        { id: 2, text: 'Approved School Pick and Drop Route', done: false },
        { id: 3, text: 'Transport Log and Passenger Handover', done: false },
      ]
    : isQari
    ? [
        { id: 1, text: 'Morning Quran Lesson Preparation', done: true },
        { id: 2, text: 'Children Quran Recitation Supervision', done: false },
        { id: 3, text: 'Lesson Attendance and Progress Notes', done: false },
      ]
    : [
        { id: 1, text: 'Hostel Block A Corridors & Staircase Mopping with Phenyl', done: true },
        { id: 2, text: 'Hostel Bathrooms & Washrooms Deep Scrubbing & Disinfection', done: true },
        { id: 3, text: 'Main Dining Hall & Kitchen Surrounds Cleaning', done: false },
        { id: 4, text: 'Campus Compound & Front Lawns Litter Sweep', done: false },
        { id: 5, text: 'Evening Trash Bin Emptying & Waste Disposal to Municipal Bin', done: false },
      ];

  const [checklist, setChecklist] = useState<DutyChecklistItem[]>(defaultChecklist);
  const [logNotes, setLogNotes] = useState('');
  const [logSubmitted, setLogSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const employeeId = user.employeeId || user.id;

  useEffect(() => {
    const loadDutyLog = async () => {
      try {
        const assignmentResponse = await fetch('/api/duty-assignments');
        if (assignmentResponse.ok) {
          const assignmentData = await assignmentResponse.json();
          const assignedItems = (assignmentData.assignments || []).map((assignment: any) => ({
            id: assignment.id,
            assignmentId: assignment.id,
            text: assignment.duty.nameEnglish,
            urdu: assignment.duty.nameUrdu,
            done: assignment.status === 'COMPLETED',
          }));

          if (assignedItems.length > 0) {
            setChecklist(assignedItems);
            return;
          }
        }

        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/duties?date=${today}&employeeId=${employeeId}`);
        if (!res.ok) return;

        const data = await res.json();
        const duty = Array.isArray(data.duties) ? data.duties[0] : null;
        if (!duty) return;

        const savedTasks = Array.isArray(duty.tasksCompleted) ? duty.tasksCompleted : [];
        const mappedTasks = defaultChecklist.map((item) => {
          const savedItem = savedTasks.find((saved: any) => String(saved.id) === String(item.id) || String(saved.text) === String(item.text));
          return {
            ...item,
            done: Boolean(savedItem?.done ?? item.done),
          };
        });

        setChecklist(mappedTasks);
        setLogNotes(duty.notes || '');
      } catch (error) {
        console.error('Failed to load duty log:', error);
      }
    };

    loadDutyLog();
  }, [employeeId]);

  const toggleCheck = (id: string | number) => {
    setChecklist(checklist.map((item) => {
      if (item.id !== id || (item.assignmentId && item.done)) return item;
      return { ...item, done: !item.done };
    }));
  };

  const handleSaveDutyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const assignedItems = checklist.filter((item) => item.assignmentId && item.done);
      if (assignedItems.length > 0) {
        for (const item of assignedItems) {
          const res = await fetch(`/api/duty-assignments/${item.assignmentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' }),
          });
          if (!res.ok) throw new Error('Failed to complete an assigned duty');
        }
      } else {
        const res = await fetch('/api/duties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            dutyDate: new Date().toISOString(),
            shift: isWaiter ? 'MORNING' : isHelper ? 'MORNING' : 'EVENING',
            tasksCompleted: checklist,
            notes: logNotes,
            status: checklist.every((item) => item.done) ? 'COMPLETED' : 'IN_PROGRESS',
          }),
        });
        if (!res.ok) throw new Error('Failed to save duty log');
      }

      setLogSubmitted(true);
      setTimeout(() => setLogSubmitted(false), 4000);
    } catch (error) {
      console.error('Duty log save error:', error);
      setLogSubmitted(false);
    } finally {
      setIsSaving(false);
    }
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
                {isWaiter ? 'Dining & Mess Service Station' : isHelper ? 'Kitchen Assistance Station' : isDriver ? 'Institutional Transport Station' : isQari ? 'Religious Education Station' : 'Campus Sanitation Station'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isWaiter
                ? 'Responsible for dining hall readiness, food distribution, and meal service.'
                : isHelper
                ? 'Assisting head cooks, food prep, dishwashing, and kitchen sanitation.'
                : isDriver
                ? 'Responsible for approved institutional transport and school pick and drop duties.'
                : isQari
                ? 'Responsible for Quran education, supervised lessons, and religious learning activities.'
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
                  {item.urdu && <span className="mt-0.5 block text-right text-base font-normal text-slate-600" dir="rtl">{item.urdu}</span>}
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
                disabled={isSaving}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? 'Saving Duty Log...' : 'Submit Shift Duty Log'}
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
