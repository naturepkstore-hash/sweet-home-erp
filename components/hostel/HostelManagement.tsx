'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bed,
  ArrowRightLeft,
  CheckCircle,
  X,
} from 'lucide-react';

interface BedItem {
  id: string;
  bedNumber: string;
  status: string;
  child: {
    id: string;
    childId: string;
    fullName: string;
    class?: { name: string } | null;
  } | null;
}

interface RoomItem {
  id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  beds: BedItem[];
}

interface BuildingItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  rooms: RoomItem[];
}

export function HostelManagement() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedChildForTransfer, setSelectedChildForTransfer] = useState<{ id: string; name: string } | null>(null);
  const [targetBedId, setTargetBedId] = useState('');
  const [availableBeds, setAvailableBeds] = useState<{ id: string; label: string }[]>([]);
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hostel/beds');
      const data = await res.json();
      if (data.success) {
        setBuildings(data.buildings || []);

        const avail: { id: string; label: string }[] = [];
        data.buildings.forEach((b: BuildingItem) => {
          b.rooms.forEach((r) => {
            r.beds.forEach((bed) => {
              if (bed.status === 'AVAILABLE') {
                avail.push({
                  id: bed.id,
                  label: `${bed.bedNumber} - ${r.roomNumber} (${b.name})`,
                });
              }
            });
          });
        });
        setAvailableBeds(avail);
      }
    } catch (err) {
      console.error('Fetch hostel error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelData();
  }, []);

  const handleOpenTransfer = (child: { id: string; name: string }) => {
    setSelectedChildForTransfer(child);
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForTransfer || !targetBedId) return;

    setTransferring(true);
    try {
      const res = await fetch('/api/hostel/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChildForTransfer.id,
          newBedId: targetBedId,
        }),
      });

      if (res.ok) {
        setTransferSuccess(true);
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferSuccess(false);
          fetchHostelData();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTransferring(false);
    }
  };

  let totalBeds = 0;
  let occupiedBeds = 0;
  buildings.forEach((b) => {
    b.rooms.forEach((r) => {
      totalBeds += r.beds.length;
      r.beds.forEach((bed) => {
        if (bed.status === 'OCCUPIED') occupiedBeds++;
      });
    });
  });

  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel & Accommodation Management</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              64 Standard Beds
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time residential occupancy, room capacities, bed allocations, and student transfers across hostel wings.
          </p>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalBeds} Beds</div>
          <div className="text-[11px] text-slate-400 mt-0.5">2 Residential Blocks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Occupied Beds</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{occupiedBeds} Beds</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{occupancyRate}% Overall Occupancy</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Available Beds</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{vacantBeds} Beds</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Ready for New Admissions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Total Rooms</div>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">8 Rooms</div>
          <div className="text-[11px] text-blue-600 mt-0.5">8 Beds per Room Capacity</div>
        </div>
      </div>

      {/* Buildings & Rooms Visual Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-10 text-center text-slate-400 text-xs">
            Loading hostel blocks and room allocations...
          </div>
        ) : (
          buildings.map((bldg) => (
            <div key={bldg.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{bldg.name}</h2>
                    <p className="text-[11px] text-slate-400">{bldg.description}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {bldg.rooms.length} Rooms
                </span>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {bldg.rooms.map((room) => {
                  const roomOccupied = room.beds.filter((b) => b.status === 'OCCUPIED').length;

                  return (
                    <div key={room.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900">{room.roomNumber}</span>
                          <span className="text-[10px] text-slate-400 ml-2 font-medium">({room.floor})</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {roomOccupied} / {room.capacity} Occupied
                        </span>
                      </div>

                      {/* Beds layout */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {room.beds.map((bed) => {
                          const isOccupied = bed.status === 'OCCUPIED' && bed.child;

                          return (
                            <div
                              key={bed.id}
                              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                                isOccupied
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                  : 'bg-white border-dashed border-slate-300 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px]">{bed.bedNumber.replace('BED-', '')}</span>
                                <Bed className={`w-3.5 h-3.5 ${isOccupied ? 'text-emerald-700' : 'text-slate-300'}`} />
                              </div>

                              <div className="mt-2 min-h-[32px]">
                                {isOccupied ? (
                                  <div>
                                    <div className="font-bold text-[11px] text-slate-900 truncate">
                                      {bed.child?.fullName}
                                    </div>
                                    <div className="text-[9px] text-emerald-700 font-semibold truncate">
                                      {bed.child?.childId}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Available</span>
                                )}
                              </div>

                              {isOccupied && (
                                <button
                                  onClick={() => handleOpenTransfer({ id: bed.child!.id, name: bed.child!.fullName })}
                                  className="mt-2 text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer pt-1 border-t border-emerald-200/60"
                                >
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                  <span>Transfer</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bed Transfer Modal */}
      {showTransferModal && selectedChildForTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Transfer Child to Another Bed</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Child transferred to new bed successfully!</span>
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Child Name</label>
                <input
                  type="text"
                  disabled
                  value={selectedChildForTransfer.name}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Available Bed</label>
                <select
                  required
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                >
                  <option value="">-- Choose Vacant Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {transferring ? 'Transferring...' : 'Execute Bed Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
