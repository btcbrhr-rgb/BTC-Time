import React, { useState } from 'react';
import { ArrowLeft, Clock, Info, ShieldAlert, BadgeHelp } from 'lucide-react';
import { DailyAttendance, CorrectionRequest, Employee } from '../types';

interface EmployeeHistoryProps {
  empId: string;
  onBack: () => void;
  attendanceData: Record<string, Record<string, DailyAttendance>>;
  dates: string[];
  corrections: CorrectionRequest[];
  onSubmitCorrection: (btnId: string, timeIn: string, timeOut: string, reason: string) => void;
  employees: Employee[];
}

export default function EmployeeHistory({
  empId,
  onBack,
  attendanceData,
  dates,
  corrections,
  onSubmitCorrection,
  employees,
}: EmployeeHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetBtnId, setTargetBtnId] = useState('');
  const [targetDateStr, setTargetDateStr] = useState('');
  const [fixTimeIn, setFixTimeIn] = useState('08:00');
  const [fixTimeOut, setFixTimeOut] = useState('17:00');
  const [fixReason, setFixReason] = useState('ลืมลงเวลาเข้า');
  const [fixNote, setFixNote] = useState('');

  const currentEmployee = employees.find((e) => e.id === empId);

  // Filter attendance records in this cycle for this employee
  const logsInCycle = dates.map((d) => {
    return attendanceData[d]?.[empId] || {
      empId,
      date: d,
      status: 'ย',
      timeIn: '',
      timeOut: '',
      ot: 0,
      penalty: 0,
      project: currentEmployee?.project || '',
      food: 0,
      trip: 0,
      other: 0,
      otherMemo: '',
      lateMinutes: 0,
      credit: 0,
      isLocked: false,
    };
  });

  // Calculate quick stats in this period for summary cards
  let activeWorkDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let lateCount = 0;
  let accumulatedOT = 0;

  logsInCycle.forEach((l) => {
    if (['W', 'คส', 'พร', 'SM'].includes(l.status)) {
      activeWorkDays += l.credit;
    } else if (l.status === 'L') {
      activeWorkDays += l.credit;
      lateCount++;
    } else if (l.status === 'A') {
      absentDays++;
    } else if (['B', 'H', 'S'].includes(l.status)) {
      leaveDays++;
    }
    accumulatedOT += l.ot || 0;
  });

  const handleOpenForm = (btnId: string, date: string, tIn: string, tOut: string) => {
    setTargetBtnId(btnId);
    setTargetDateStr(date);
    setFixTimeIn(tIn || '08:00');
    setFixTimeOut(tOut || '17:00');
    setFixReason('ลืมลงเวลาเข้า');
    setFixNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixTimeIn || !fixTimeOut || !fixReason) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const fullReason = fixReason === 'อื่นๆ' ? `อื่นๆ: ${fixNote}` : fixReason;
    onSubmitCorrection(targetBtnId, fixTimeIn, fixTimeOut, fullReason);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Header */}
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
        <span>สถิติประวัติและสะสมเครดิตงวดเงินเดือน</span>
      </h3>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 text-red-900 border border-red-150 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase text-red-700">สะสมเครดิตวันทำงาน</p>
          <p className="text-2xl font-black mt-1 font-display">
            {activeWorkDays} <span className="text-xs font-bold">วัน</span>
          </p>
          <p className="text-[9px] text-red-600 font-bold mt-1">เป้าหมายงวดจ่าย: 30 วันปฏิทิน</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-rose-100/40 p-1.5 rounded-lg">
              <span className="block text-[8px] font-black text-rose-800">ขาดงาน</span>
              <span className="text-xs font-extrabold text-rose-700">{absentDays} วัน</span>
            </div>
            <div className="bg-amber-100/40 p-1.5 rounded-lg">
              <span className="block text-[8px] font-black text-amber-800">ลากิจ/ป่วย</span>
              <span className="text-xs font-extrabold text-amber-700">{leaveDays} วัน</span>
            </div>
          </div>
          <p className="text-[8px] text-slate-400 font-bold text-center mt-2 leading-none">
            อัปเดตระบบสปอนเซอร์งบประมาณรายวัน
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ⏱️
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold">มาสายรวม</p>
            <p className="text-sm font-black text-slate-800">{lateCount} ครั้ง</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            🔥
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold">สะสม OT ชั่วโมง</p>
            <p className="text-sm font-black text-slate-800">{accumulatedOT} ชม.</p>
          </div>
        </div>
      </div>

      {/* Day by Day Log Records */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-500 mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-red-600" />
          <span>รายละเอียดบันทึกตอกเวลารายวัน</span>
        </h3>

        <div className="space-y-3">
          {logsInCycle.map((item) => {
            const btnId = `btn-fix-${item.date}`;
            const existCorr = corrections.find((c) => c.btnId === btnId && c.empId === empId);
            const isSent = !!existCorr;

            let statusLabel = 'ปกติ';
            let statusStyle = 'bg-emerald-50 text-emerald-800 border-emerald-100';

            if (item.status === 'L') {
              statusLabel = 'มาสาย';
              statusStyle = 'bg-amber-50 text-amber-800 border-amber-100';
            } else if (item.status === 'A') {
              statusLabel = 'ขาดงาน';
              statusStyle = 'bg-rose-50 text-rose-800 border-rose-100';
            } else if (item.isLocked) {
              statusLabel = 'บัญชีล็อก';
              statusStyle = 'bg-red-100 text-red-800 border-red-200 animate-pulse';
            } else if (['B', 'H', 'S', 'SM'].includes(item.status)) {
              statusLabel = `ลาหยุด (${item.status})`;
              statusStyle = 'bg-indigo-50 text-indigo-800 border-indigo-100';
            } else if (item.status === 'ย') {
              statusLabel = 'วันหยุดประจำสัปดาห์';
              statusStyle = 'bg-slate-100 text-slate-400 border-slate-200';
            }

            return (
              <div
                key={item.date}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-800 font-display">
                    {new Date(item.date).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black ${statusStyle}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <span className="block text-[8px] font-black text-slate-400 uppercase">เวลาตอกบัตร</span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {item.timeIn && item.timeOut ? `${item.timeIn} - ${item.timeOut}` : 'ไม่ได้ลงเวลา'}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <span className="block text-[8px] font-black text-slate-400 uppercase">โอทีสะสม</span>
                    <span className="text-xs font-extrabold text-slate-700">{item.ot} ชม.</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <span className="block text-[8px] font-black text-slate-400 uppercase">สนับสนุนค่าข้าว</span>
                    <span className="text-xs font-extrabold text-slate-700">฿{item.food}</span>
                  </div>
                </div>

                {/* Correction trigger button */}
                <div className="flex justify-end pt-1">
                  {isSent ? (
                    <button
                      disabled
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                        existCorr.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {existCorr.status === 'approved' ? 'อนุมัติแก้เวลาเรียบร้อย' : 'อยู่ระหว่างรอผู้จัดการพิจารณา'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenForm(btnId, item.date, item.timeIn, item.timeOut)}
                      className="px-3.5 py-1.5 border-1.5 border-red-600 hover:bg-red-50/40 text-red-600 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
                    >
                      ขอแก้ไขหรือปลดล็อกเวลา
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correction Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-[1000] p-0 animate-fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-800 font-display">
                ส่งขอแก้ไขเวลา ({targetDateStr})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">เวลาเข้างานใหม่</label>
                  <input
                    type="time"
                    required
                    value={fixTimeIn}
                    onChange={(e) => setFixTimeIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">เวลาออกงานใหม่</label>
                  <input
                    type="time"
                    required
                    value={fixTimeOut}
                    onChange={(e) => setFixTimeOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">สาเหตุที่ขอแก้ไขเวลางาน</label>
                <select
                  value={fixReason}
                  onChange={(e) => setFixReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-600 bg-white"
                >
                  <option value="ลืมตอกบัตรเข้า">ลืมตอกบัตรเข้างาน</option>
                  <option value="ลืมตอกบัตรออก">ลืมตอกบัตรออกงาน</option>
                  <option value="ติดธุระนอกสถานที่">ติดพบคู่ค้าหน้างานนอกพื้นที่</option>
                  <option value="ระบบเครื่องสแกนขัดข้อง">ระบบเครื่องสแกนขัดข้อง</option>
                  <option value="อื่นๆ">อื่นๆ (กรุณาระบุด้านล่าง)</option>
                </select>
              </div>

              {fixReason === 'อื่นๆ' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={3}
                    required
                    value={fixNote}
                    onChange={(e) => setFixNote(e.target.value)}
                    placeholder="กรุณาระบุสาเหตุเพิ่มเติมในการแก้ไขเวลา..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition hover:from-red-700 hover:to-rose-800 cursor-pointer text-center"
              >
                ยืนยันและส่งคำขอให้แอดมิน
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
