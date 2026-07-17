import React, { useState } from 'react';
import {
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Clock,
  Briefcase,
  DollarSign,
  ChevronRight,
  Bell,
  Sparkles,
  Info,
} from 'lucide-react';
import { Period, Payslip, Announcement } from '../types';

interface EmployeeHomeProps {
  displayName: string;
  empId: string;
  onNavigate: (viewId: string) => void;
  isRecurringEnabled: boolean;
  onToggleRecurringAdvance: (enabled: boolean, amount: number) => void;
  importedSlips: Payslip[];
  onViewSlip: (filename: string, amount: number) => void;
  announcements?: Announcement[];
}

export default function EmployeeHome({
  displayName,
  empId,
  onNavigate,
  isRecurringEnabled,
  onToggleRecurringAdvance,
  importedSlips,
  onViewSlip,
  announcements = [],
}: EmployeeHomeProps) {
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceType, setAdvanceType] = useState<'ONCE' | 'RECURRING'>('ONCE');

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(advanceAmount);
    if (!amount || amount <= 0) {
      alert('กรุณากรอกยอดเงินที่ถูกต้อง');
      return;
    }
    onToggleRecurringAdvance(advanceType === 'RECURRING', amount);
    setIsAdvanceModalOpen(false);
    setAdvanceAmount('');
  };

  const matchingSlips = importedSlips.filter((s) => s.empId === empId);

  return (
    <div className="space-y-6">
      {/* Quick Access Menu Grid */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-3.5 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-red-600 rounded-full" />
          <span>เมนูหลักผู้ปฏิบัติงาน</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('clock')}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800">ลงเวลางาน</span>
          </button>

          <button
            onClick={() => onNavigate('leave')}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800">ยื่นใบลา</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800">ประวัติเวลา</span>
          </button>
        </div>
      </div>

      {/* Welfare & Benefits Section */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-3.5 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-red-600 rounded-full" />
          <span>สิทธิ์ประโยชน์และสวัสดิการของบริษัท</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm text-left flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-800 leading-tight">เบิกเงินสำรอง</p>
              <p className="text-[9px] text-slate-400 mt-0.5">เบิกใช้กลางงวดเงินเดือน</p>
            </div>
          </button>

          <button
            onClick={() => setIsSlipModalOpen(true)}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm text-left flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-800 leading-tight">สลิปเงินเดือน</p>
              <p className="text-[9px] text-slate-400 mt-0.5">ดูบันทึกและดาวน์โหลดสลิป</p>
            </div>
          </button>
        </div>
      </div>

      {/* Announcements and notices */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-3.5 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-red-600 rounded-full" />
          <span>ประกาศและข่าวสารแจ้งเตือน</span>
        </h3>
        <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {/* Active recurring advance announcement if applicable */}
          {isRecurringEnabled && (
            <div className="p-4 bg-amber-50/50 flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex-grow">
                <h4 className="font-extrabold text-xs text-amber-950">เบิกเงินสำรองกลางเดือน (แบบคงที่อัตโนมัติ)</h4>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  ระบบตั้งค่าการส่งสิทธิ์เบิกให้คุณทุกวันที่ 1 ยอดเงินจะหักอัตโนมัติในสลิป
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[9px] font-black shrink-0">
                ACTIVE
              </span>
            </div>
          )}

          {announcements.map((item) => (
            <div key={item.id} className="p-4 flex gap-3.5 items-start">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'info'
                    ? 'bg-blue-50 text-blue-600'
                    : item.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <h4 className="font-extrabold text-xs text-slate-800 leading-snug">{item.title}</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">{item.time}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                  item.type === 'info'
                    ? 'bg-blue-100 text-blue-800'
                    : item.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Advance Modal */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-[1000] p-0 animate-fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-800 font-display">เบิกเงินสะสมสำรอง (กลางงวด)</h3>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdvanceSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-150 p-3.5 rounded-xl text-xs text-amber-900 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>เงื่อนไข:</strong> ขอยอดเบิกสำรองได้ไม่เกิน 50% ของฐานค่าแรงรวม เพื่อรักษาสมดุลภาษีและสวัสดิการ
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                  จำนวนเงินที่ต้องการเบิก (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-600 bg-white"
                  placeholder="ระบุตัวเลข เช่น 3000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">รูปแบบสิทธิ์ประโยชน์</label>
                <div className="space-y-2.5">
                  <div
                    onClick={() => setAdvanceType('ONCE')}
                    className={`p-3.5 border rounded-xl flex items-center gap-3.5 cursor-pointer transition ${
                      advanceType === 'ONCE' ? 'border-red-600 bg-red-50/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      {advanceType === 'ONCE' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-800">เบิกเฉพาะงวดเดือนปัจจุบันนี้เท่านั้น</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">ระบบจะหักยอดเงินคืนทันทีในรอบสลิปถัดไปครั้งเดียว</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setAdvanceType('RECURRING')}
                    className={`p-3.5 border rounded-xl flex items-center gap-3.5 cursor-pointer transition ${
                      advanceType === 'RECURRING' ? 'border-red-600 bg-red-50/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      {advanceType === 'RECURRING' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-800">ส่งยอดเบิกคงที่ต่อเนื่องทุกๆ เดือน (คงที่)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ระบบจะอำนวยความสะดวกยื่นเบิกให้อัตโนมัติในวันที่ 1 ของทุกรอบบัญชีการจ่าย
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition hover:from-red-700 hover:to-rose-800 cursor-pointer text-center"
              >
                ยืนยันการตั้งค่าเบิกสำรอง
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip List Modal */}
      {isSlipModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-[1000] p-0 animate-fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 font-display">สลิปเงินเดือนของคุณ</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">รวมประวัติการสั่งจ่ายรายรอบบัญชีบุคคล</p>
              </div>
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              {/* Core mock payslip */}
              <div
                onClick={() => onViewSlip('สลิปเงินเดือนเมษายน_2569.pdf', 25050)}
                className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between hover:border-red-600 hover:bg-red-50/10 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
                    📄
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-800">รอบเดือน เมษายน 2569</p>
                    <p className="text-[9px] text-slate-400">สั่งจ่ายแล้วเมื่อ: 28 เม.ย. 69</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-red-600">฿25,050.00</p>
                  <p className="text-[9px] text-emerald-600 font-bold">ตรวจสอบสำเร็จ</p>
                </div>
              </div>

              {/* Dynamic imported payslips */}
              {matchingSlips.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onViewSlip(s.filename, s.amount)}
                  className="p-4 border border-emerald-200 bg-emerald-50/10 rounded-2xl flex items-center justify-between hover:border-emerald-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-800">รอบเดือน {s.period} (ใหม่)</p>
                      <p className="text-[9px] text-slate-400">อัปเดตเมื่อ: {s.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-emerald-700">฿{s.amount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{s.filename}</p>
                  </div>
                </div>
              ))}

              {matchingSlips.length === 0 && (
                <p className="text-center text-[10px] text-slate-400 py-3">ยังไม่มีไฟล์สลิปใหม่ที่อัปเดตโดยแอดมินในรอบงวดนี้</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
