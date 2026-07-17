import React, { useState } from 'react';
import { ArrowLeft, Plus, ShieldCheck, FileCheck, Upload, AlertCircle } from 'lucide-react';
import { Employee, LeaveRequest } from '../types';

interface EmployeeLeaveProps {
  empId: string;
  onBack: () => void;
  employees: Employee[];
  leaves: LeaveRequest[];
  onSubmitLeave: (type: string, start: string, end: string, reason: string, fileAttached: boolean) => void;
}

export default function EmployeeLeave({
  empId,
  onBack,
  employees,
  leaves,
  onSubmitLeave,
}: EmployeeLeaveProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const emp = employees.find((e) => e.id === empId) || employees[0];
  const myLeaves = leaves.filter((l) => l.empId === empId);

  const quotas = [
    {
      key: 'sick',
      label: 'ลาป่วยสะสม (S/SM)',
      total: emp.quotas.sick,
      remaining: emp.currentQuotas.sick,
      used: emp.quotas.sick - emp.currentQuotas.sick,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 text-red-600',
    },
    {
      key: 'personal',
      label: 'ลากิจส่วนตัว (B)',
      total: emp.quotas.personal,
      remaining: emp.currentQuotas.personal,
      used: emp.quotas.personal - emp.currentQuotas.personal,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 text-amber-600',
    },
    {
      key: 'vacation',
      label: 'ลาพักร้อนประจำปี (H)',
      total: emp.quotas.vacation,
      remaining: emp.currentQuotas.vacation,
      used: emp.quotas.vacation - emp.currentQuotas.vacation,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !leaveStart || !leaveEnd || !leaveReason) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (leaveType === 'SM' && !fileName) {
      alert('กรณีลาป่วยพิเศษ (SM) จำเป็นต้องแนบเอกสารใบรับรองแพทย์เป็นหลักฐาน');
      return;
    }

    onSubmitLeave(leaveType, leaveStart, leaveEnd, leaveReason, !!fileName);
    setIsModalOpen(false);
    setLeaveType('');
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    setFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
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
        <span>สรุปวันลาคงเหลือประจำปี 2569</span>
      </h3>

      {/* Quotas grid display */}
      <div className="grid grid-cols-3 gap-3">
        {quotas.map((q) => {
          const percent = (q.remaining / q.total) * 100;
          return (
            <div key={q.key} className="bg-white border border-slate-200 rounded-2xl p-3 text-center space-y-1 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${q.bgColor} flex items-center justify-center mx-auto mb-1.5`}>
                <FileCheck className="w-4 h-4" />
              </div>
              <p className="text-[9px] text-slate-400 font-bold tracking-tight line-clamp-1">{q.label}</p>
              <p className="text-base font-black text-slate-800">{q.remaining} วัน</p>
              <p className="text-[8px] text-slate-400 font-bold">
                ใช้แล้ว {q.used} / {q.total} วัน
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className={`${q.color} h-full`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const today = new Date().toISOString().split('T')[0];
          setLeaveStart(today);
          setLeaveEnd(today);
          setLeaveType('');
          setLeaveReason('');
          setFileName('');
          setIsModalOpen(true);
        }}
        className="w-full py-4 border-2 border-dashed border-red-600 text-red-600 hover:bg-red-50/20 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>สร้างคำขอใบลาใหม่ประจำปี</span>
      </button>

      {/* Leave request lists */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-500 mb-3 uppercase tracking-wider">ประวัติใบลาสะสมค้างอนุมัติ</h3>
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm space-y-3.5">
          {myLeaves.map((item) => {
            let badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            let statusText = 'รอผู้จัดการอนุมัติ';

            if (item.status === 'approved') {
              badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              statusText = 'อนุมัติเรียบร้อย';
            } else if (item.status === 'rejected') {
              badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
              statusText = 'ปฏิเสธคำขอ';
            }

            return (
              <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 text-[11px]">
                    ประเภท: {item.type === 'S' ? 'ลาป่วยปกติ' : item.type === 'SM' ? 'ลาป่วยพิเศษ (SM)' : 'ลากิจ/ลาพักผ่อน'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black ${badgeClass}`}>
                    {statusText}
                  </span>
                </div>
                <p className="text-slate-500 leading-none">
                  ช่วงเวลาลา: {item.start} ถึง {item.end}
                </p>
                <p className="italic text-slate-400">เหตุผล: "{item.reason}"</p>
              </div>
            );
          })}

          {myLeaves.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-3 font-semibold">ยังไม่มีประวัติยื่นขอลาในรอบเดือนนี้</p>
          )}
        </div>
      </div>

      {/* Leave form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-[1000] p-0 animate-fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-850 font-display">ยื่นใบลาใหม่ประจำบริษัท</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1.5">ประเภทของการลาหยุด</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 bg-white"
                >
                  <option value="">-- กรุณาเลือกสิทธิ์ใบลา --</option>
                  <option value="S">ลาป่วยปกติ (S - Uncertified)</option>
                  <option value="SM">ลาป่วยมีใบรับรองแพทย์ (SM - Certified)</option>
                  <option value="B">ลากิจปกติ (B - Personal Leave)</option>
                  <option value="H">ลาพักร้อนสะสมปี (H - Vacation)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1.5">เริ่มต้นวันที่</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5">สิ้นสุดวันที่</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5">เหตุผลและรายละเอียดเพิ่มเติม</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="เช่น ลาป่วยจากอาการไข้หวัด, ลากิจส่วนตัวจัดการเอกสารที่ต่างจังหวัด..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-red-600 bg-white text-slate-800"
                />
              </div>

              {/* Document upload zone (Required for SM, optional others) */}
              <div>
                <label className="block text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <span>เอกสารหลักฐานแนบ</span>
                  {leaveType === 'SM' && <span className="text-red-500 font-extrabold">(จำเป็นสำหรับลาป่วย SM)</span>}
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('leave-file-input')?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    dragActive ? 'border-red-600 bg-red-50/10' : 'border-slate-200 hover:bg-slate-50'
                  } ${fileName ? 'border-emerald-500 bg-emerald-50/10' : ''}`}
                >
                  <input
                    id="leave-file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${fileName ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {fileName ? (
                    <p className="text-xs text-emerald-700 font-extrabold">✓ แนบหลักฐานสำเร็จ: {fileName}</p>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-500">คลิกที่นี่หรือลากใบรับรองแพทย์มาวางเพื่ออัปโหลด</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        รองรับ PDF, JPEG, PNG ขนาดไม่เกิน 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition hover:from-red-700 hover:to-rose-800 cursor-pointer text-center"
              >
                ยืนยันการจัดส่งคำลา
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
