import React from 'react';
import { LogOut, Shield, Award, User, Clock, Building, CreditCard, MapPin, Calendar, Phone } from 'lucide-react';
import { Employee } from '../types';

interface ProfileViewProps {
  displayName: string;
  empId: string;
  role: string;
  userRole: 'admin' | 'employee';
  onLogout: () => void;
  employees: Employee[];
}

export default function ProfileView({
  displayName,
  empId,
  role,
  userRole,
  onLogout,
  employees,
}: ProfileViewProps) {
  const currentEmployee = employees.find((e) => e.id === empId);

  const avatarSrc = currentEmployee?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=AF252F&color=ffffff&bold=true&size=180`;

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
        <span className="w-1 h-3.5 bg-red-600 rounded-full" />
        <span>ข้อมูลโปรไฟล์ผู้ใช้งาน</span>
      </h3>

      <div className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Decorative corner shape */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl" />

        <div className="text-center mb-6">
          <img
            src={avatarSrc}
            className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-md mx-auto mb-4 object-cover"
            alt="Profile card"
            referrerPolicy="no-referrer"
          />

          <h3 className="text-lg font-black text-slate-850 font-display">คุณ{displayName}</h3>
          <p className="text-xs text-slate-400 font-bold mt-0.5 font-mono">
            {userRole === 'admin' ? 'สิทธิ์การใช้งานสูงสุด' : `รหัสพนักงาน: ${empId}`}
          </p>

          <div className="inline-block mt-3 bg-red-50 border border-red-150 text-red-700 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            {userRole === 'admin' ? 'ผู้บริหารระบบปฏิบัติการ' : role || 'พนักงาน'}
          </div>
        </div>

        {/* Info Grid */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          {/* General Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-red-600 shrink-0" />
              <span>ตำแหน่งงาน: {userRole === 'admin' ? 'หัวหน้าฝ่ายปฏิบัติการ' : role}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                โครงการประจำ: {userRole === 'admin' ? 'สำนักงานใหญ่ (HQ)' : currentEmployee?.project || '-'}
              </span>
            </div>
          </div>

          {userRole === 'employee' && currentEmployee && (
            <>
              {/* Personal Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                  👤 ข้อมูลส่วนบุคคล (Personal Details)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-650">
                  {currentEmployee.idCard && (
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">เลขบัตรประชาชน</p>
                        <p className="font-extrabold text-slate-800 font-mono">{currentEmployee.idCard}</p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.birthDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">วันเดือนปีเกิด</p>
                        <p className="font-extrabold text-slate-800">{currentEmployee.birthDate}</p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">เบอร์โทรศัพท์</p>
                        <p className="font-extrabold text-slate-800 font-mono">{currentEmployee.phone}</p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.lineUserId && (
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">Line User ID</p>
                        <p className="font-extrabold text-slate-800 font-mono break-all text-[10px]">{currentEmployee.lineUserId}</p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.address && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">ที่อยู่ปัจจุบัน</p>
                        <p className="font-extrabold text-slate-800 leading-relaxed">{currentEmployee.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Contract */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                  🏢 สัญญาจ้างและวันทำงาน (Employment details)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-650">
                  {currentEmployee.companyName && (
                    <div className="flex items-start gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">สังกัดบริษัท</p>
                        <p className="font-extrabold text-slate-800">{currentEmployee.companyName}</p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.startDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">วันที่เริ่มงาน</p>
                        <p className="font-extrabold text-slate-800">{currentEmployee.startDate}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">วันหยุดประจำสัปดาห์</p>
                      <p className="font-extrabold text-red-600">วัน{currentEmployee.weeklyOffDay || 'อาทิตย์'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">สิทธิ์ในระบบ</p>
                      <p className="font-extrabold text-slate-800">
                        {currentEmployee.permission === 'admin'
                          ? '🔑 ผู้บริหารระบบ (Admin)'
                          : currentEmployee.permission === 'staff'
                          ? '📋 ผู้ดูแลไซต์งาน (Foreman)'
                          : '👷 พนักงานปกติ (Employee)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                  🪙 บัญชีรับเงินและข้อมูลรายได้ (Payroll Information)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-650">
                  {currentEmployee.bankName && (
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">ธนาคารปลายทาง</p>
                        <p className="font-extrabold text-slate-800">
                          {currentEmployee.bankName} {currentEmployee.bankBranch ? `สาขา ${currentEmployee.bankBranch}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentEmployee.bankAccount && (
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">หมายเลขบัญชี</p>
                        <p className="font-extrabold text-slate-800 font-mono">{currentEmployee.bankAccount}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">อัตราตัวคูณเวลาทำงานพิเศษ (OT)</p>
                      <p className="font-extrabold text-slate-800">{currentEmployee.otMultiplier || 1.5} เท่า</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">เวลาเข้างาน/คำนวณเลท</p>
                      <p className="font-extrabold text-slate-800">สายเกิน 08:15 / โอทีหลัง 17:15</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Core Settings notice */}
          {userRole === 'admin' && (
            <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
              <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>ข้อมูลระบบสัญญากลาง:</strong> ตอกบัตรพนักงานก่อสร้างคิดตามชั่วโมงงาน {currentEmployee?.workHoursPerDay || 8} ชม./วัน ตัวหารรายเดือน {currentEmployee?.divisor || 30} วัน มีระบบคัดกรองพิกัดและลายนิ้วมือจำลองทางไกล
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>ออกจากระบบและเคลียร์สิทธิ์ผู้ใช้</span>
      </button>
    </div>
  );
}
