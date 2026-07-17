import React, { useState } from 'react';
import { Calendar, ChevronDown, LogOut, ShieldAlert } from 'lucide-react';
import { Period } from '../types';

interface HeaderProps {
  displayName: string;
  empId: string;
  role: string;
  isClockedIn: boolean;
  clockedInTime: string | null;
  periods: Period[];
  selectedPeriodIndex: number;
  onSelectPeriod: (idx: number) => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee';
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingLeavesCount?: number;
  pendingCashCount?: number;
}

export default function Header({
  displayName,
  empId,
  role,
  isClockedIn,
  clockedInTime,
  periods,
  selectedPeriodIndex,
  onSelectPeriod,
  onLogout,
  userRole,
  activeTab,
  onTabChange,
  pendingLeavesCount = 0,
  pendingCashCount = 0,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPeriod = periods[selectedPeriodIndex] || periods[0];

  return (
    <header className="bg-gradient-to-r from-red-700 to-rose-800 text-white rounded-b-[28px] px-6 py-5 shadow-lg shadow-red-700/10 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=ffffff&color=AF252F&bold=true&size=128`}
              className="w-11 h-11 rounded-xl border-2 border-white/40 object-cover bg-white shadow-inner"
              alt="User profile"
            />
            <div>
              <h2 className="font-extrabold text-sm md:text-base leading-snug tracking-tight">คุณ{displayName}</h2>
              <p className="text-[10px] text-red-100 font-bold tracking-wide">
                {userRole === 'admin' ? 'สิทธิ์: ผู้บริหารสูงสุด' : `รหัส: ${empId}`}
              </p>
              {isClockedIn && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>กำลังทำงาน (เข้างาน: {clockedInTime})</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop/Tablet admin navigator bar inside the header */}
          {userRole === 'admin' && (
            <div className="hidden md:flex items-center gap-2 bg-black/10 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 relative ${
                  activeTab === 'dashboard' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <span>แดชบอร์ด</span>
                {pendingLeavesCount > 0 && (
                  <span className="flex items-center justify-center bg-red-600 text-white text-[9px] h-4.5 px-1.5 rounded-full font-sans font-extrabold animate-bounce shadow">
                    {pendingLeavesCount} ลาใหม่
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange('attendance')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'attendance' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                จัดการเวลางาน
              </button>
              <button
                onClick={() => onTabChange('costing')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'costing' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                ต้นทุนโครงการ
              </button>
              <button
                onClick={() => onTabChange('imports')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'imports' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                นำเข้าเวลางาน/สลิป
              </button>
              <button
                onClick={() => onTabChange('management')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'management' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <span>จัดการระบบ & ประกาศ</span>
                {pendingCashCount > 0 && (
                  <span className="flex items-center justify-center bg-yellow-400 text-slate-950 text-[9px] h-4.5 px-1.5 rounded-full font-sans font-extrabold animate-pulse shadow">
                    เบิกใหม่ ({pendingCashCount})
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange('settings')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'settings' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                ตั้งค่าระบบ
              </button>
              <button
                onClick={() => onTabChange('profile')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'profile' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                โปรไฟล์
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-lg font-bold transition bg-red-800 text-white hover:bg-red-900 border border-red-950/20 cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          )}

          {/* Desktop/Tablet employee navigator bar inside the header */}
          {userRole === 'employee' && (
            <div className="hidden md:flex items-center gap-2 bg-black/10 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => onTabChange('home')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'home' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                หน้าแรก
              </button>
              <button
                onClick={() => onTabChange('clock')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'clock' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                ลงเวลา
              </button>
              <button
                onClick={() => onTabChange('leave')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'leave' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                การลา
              </button>
              <button
                onClick={() => onTabChange('history')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'history' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                ประวัติ
              </button>
              <button
                onClick={() => onTabChange('profile')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'profile' ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                โปรไฟล์
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-lg font-bold transition bg-red-800 text-white hover:bg-red-900 border border-red-950/20 cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          )}

          {userRole && (
            <button
              onClick={onLogout}
              className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/10 text-white cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cycle Month Selector Slider */}
        <div className="relative mt-4.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-white/15 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-red-200" />
              <div>
                <p className="text-xs font-black text-white">{currentPeriod.monthName}</p>
                <p className="text-[10px] text-red-100 opacity-80">
                  รอบงวด: {currentPeriod.startDate} - {currentPeriod.endDate}
                </p>
              </div>

            </div>
            <ChevronDown className={`w-4 h-4 text-red-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute top-[108%] left-0 right-0 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  เลือกรอบบัญชีสำหรับการคำนวณสถิติ
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {periods.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectPeriod(idx);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-none hover:bg-red-50/40 transition-all flex items-center justify-between ${
                        idx === selectedPeriodIndex ? 'bg-red-50/60 font-bold text-red-700' : ''
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{p.monthName}</p>
                        <p className="text-[10px] text-slate-400">
                          รอบ: {p.startDate} - {p.endDate}
                        </p>
                      </div>
                      {idx === selectedPeriodIndex && (
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
