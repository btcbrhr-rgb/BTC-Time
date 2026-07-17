import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface EmployeeClockProps {
  onBack: () => void;
  isClockedIn: boolean;
  clockedInTime: string | null;
  onClock: (type: 'IN' | 'OUT') => void;
}

export default function EmployeeClock({
  onBack,
  isClockedIn,
  clockedInTime,
  onClock,
}: EmployeeClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: Date) => {
    return t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (t: Date) => {
    return t.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* Header Back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-500">ย้อนกลับหน้าหลัก</span>
      </div>

      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
        <span className="w-1 h-3.5 bg-red-600 rounded-full" />
        <span>ลงเวลางานและลงพื้นที่ไซด์งาน</span>
      </h3>

      <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-4xl md:text-5xl font-black text-slate-850 font-mono tracking-wider tabular-nums">
            {formatTime(time)}
          </div>
          <p className="text-xs font-bold text-slate-400">{formatDate(time)}</p>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-[11px] text-slate-500 font-medium">
          🚩 พิกัดลงเวลา: ไซด์งานหลัก BTC บุรีรัมย์ (ผ่านระบบเครื่องสแกน GPS)
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => onClock('IN')}
            disabled={isClockedIn}
            className={`py-4 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              isClockedIn
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-103 active:scale-97'
            }`}
          >
            {isClockedIn ? 'ลงเข้างานแล้ว' : 'ลงเข้างาน (IN)'}
          </button>

          <button
            onClick={() => onClock('OUT')}
            disabled={!isClockedIn}
            className={`py-4 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              !isClockedIn
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-103 active:scale-97'
            }`}
          >
            ลงออกงาน (OUT)
          </button>
        </div>

        {isClockedIn && (
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>คุณอยู่ในกะปฏิบัติงานปัจจุบัน (ตอกเวลาเข้า: {clockedInTime})</span>
          </div>
        )}
      </div>
    </div>
  );
}
