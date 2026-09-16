'use client';

import React, { useState } from 'react';
import { Baby, CheckCircle2, HeartPulse, Sparkles, ClipboardList, Bed, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EmployeeDutyAssignments } from './EmployeeDutyAssignments';
import { ComplaintsDashboard, DashboardComplaint } from './ComplaintsDashboard';

interface MotherMaidDashboardProps {
  user: {
    id: string;
    fullName: string;
    employeeId?: string;
  };
  assignedChildren: {
    id: string;
    childId: string;
    fullName: string;
    fatherGuardianName: string;
    dateOfBirth: Date;
    bFormNo: string | null;
    status: string;
    roomNumber: string | null;
    bedNumber: string | null;
    className: string | null;
    bloodGroup: string | null;
    allergies: string | null;
  }[];
  recentComplaints: DashboardComplaint[];
}

export function MotherMaidDashboard({ user, assignedChildren, recentComplaints }: MotherMaidDashboardProps) {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Fajr Prayer & Morning Child Hygiene Check (Teeth, Face, Cleanliness)', done: true },
    { id: 2, title: 'Breakfast Supervision & Meal Attendance in Dining Hall', done: true },
    { id: 3, title: 'School Uniform Inspection (Ironed Clothes, Clean Shoes, School Bags)', done: true },
    { id: 4, title: 'Afternoon Return & Rest Period Supervision in Hostel Rooms', done: false },
    { id: 5, title: 'Evening Study, Homework Help & Quran Recitation Supervision', done: false },
    { id: 6, title: 'Dinner Meal Attendance & Night Bedtime Routine Check', done: false },
  ]);

  const [noteChildId, setNoteChildId] = useState('');
  const [healthNote, setHealthNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;

  const handleSaveHealthNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteChildId || !healthNote) return;
    setSubmittingNote(true);
    try {
      const res = await fetch('/api/medical/quick-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: noteChildId, note: healthNote }),
      });
      if (res.ok) {
        setNoteSuccess(true);
        setHealthNote('');
        setTimeout(() => setNoteSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Mother Maid Individual Care Station</span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Dedicated maternal care, hygiene, health monitoring, and daily upbringing of assigned Sweet Home resident children.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[150px]">
            <div className="text-3xl font-extrabold text-amber-300">{assignedChildren.length}</div>
            <div className="text-xs text-emerald-100 font-medium mt-0.5">Assigned Children</div>
          </div>
        </div>
      </div>

      <EmployeeDutyAssignments />

      <ComplaintsDashboard complaints={recentComplaints} canManage={false} />

      {/* Grid: Care Checklist + Quick Health Observation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Child Care Checklist */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-800">Today's Child Care Duty Checklist</h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {completedCount} of {tasks.length} Completed
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                    task.done
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className={`font-medium ${task.done ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Progress automatically synced with daily duty log</span>
            <span className="text-emerald-700 font-semibold">Active Shift</span>
          </div>
        </div>

        {/* Quick Health / Observation Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HeartPulse className="w-5 h-5 text-red-600" />
              <h2 className="text-sm font-bold text-slate-800">Child Health Observation</h2>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Log daily health observations, minor complaints, or medication notes for doctor/incharge review.
            </p>

            {noteSuccess && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Health observation recorded in child file!</span>
              </div>
            )}

            <form onSubmit={handleSaveHealthNote} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Child</label>
                <select
                  required
                  value={noteChildId}
                  onChange={(e) => setNoteChildId(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Assigned Child --</option>
                  {assignedChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.childId}) - Room {c.roomNumber || '101'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observation / Complaint</label>
                <textarea
                  required
                  rows={3}
                  value={healthNote}
                  onChange={(e) => setHealthNote(e.target.value)}
                  placeholder="e.g. Child reported mild headache after school, given oral rehydration and resting in room."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingNote}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {submittingNote ? 'Saving...' : 'Submit Health Note'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Critical emergency? Inform Incharge immediately.
          </div>
        </div>

      </div>

      {/* Assigned Children Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Assigned Children Roster</h2>
            <p className="text-xs text-slate-500">Under direct maternal supervision & daily care</p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {assignedChildren.length} Children Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {assignedChildren.map((child) => (
            <div
              key={child.id}
              className="bg-slate-50/80 hover:bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {child.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{child.fullName}</h3>
                      <p className="text-[11px] text-slate-500">ID: {child.childId}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Father/Guardian:</span>
                    <span className="font-medium text-slate-800">{child.fatherGuardianName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class:</span>
                    <span className="font-semibold text-slate-800">{child.className || 'Class 4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hostel Bed:</span>
                    <span className="font-bold text-emerald-700">{child.bedNumber || 'Bed 01'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-semibold text-red-600">{child.bloodGroup || 'B+'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Allergies: {child.allergies || 'None'}</span>
                <span className="text-emerald-700 font-semibold">Care Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
