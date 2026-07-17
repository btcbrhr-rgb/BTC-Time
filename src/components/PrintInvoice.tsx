import React from 'react';
import { Employee, DailyAttendance } from '../types';
import { getEmployeeWages, applyRounding, activeSystemSettings } from '../data';

interface PrintInvoiceProps {
  project: string;
  billingMonthName: string;
  employees: Employee[];
  attendanceData: Record<string, Record<string, DailyAttendance>>;
  dates: string[];
}

export default function PrintInvoice({
  project,
  billingMonthName,
  employees,
  attendanceData,
  dates,
}: PrintInvoiceProps) {
  const emps = employees.filter((e) => e.project === project);

  let totalDaysSum = 0;
  let totalWagesSum = 0;
  let totalFoodSum = 0;
  let totalTripSum = 0;
  let totalOtherSum = 0;

  const rows = emps.map((emp, idx) => {
    let credits = 0;
    let otHours = 0;
    let foodSum = 0;
    let tripSum = 0;
    let otherSum = 0;
    let isLocked = false;

    dates.forEach((d) => {
      const log = (attendanceData[d]?.[emp.id] || { credit: 0, ot: 0, food: 0, trip: 0, other: 0, isLocked: false }) as DailyAttendance;
      if (log.isLocked) isLocked = true;
      credits += log.credit || 0;
      otHours += log.ot || 0;
      foodSum += log.food || 0;
      tripSum += log.trip || 0;
      otherSum += log.other || 0;
    });

    const { dayWage, hrWage } = getEmployeeWages(emp);
    const baseSalaryEarned = dayWage * credits;
    const otEarned = otHours * hrWage * 1.0;

    const rawWages = baseSalaryEarned + otEarned;
    const wages = applyRounding(rawWages, activeSystemSettings.roundSalary);

    const roundedFoodSum = applyRounding(foodSum, activeSystemSettings.roundWelfare);
    const roundedTripSum = applyRounding(tripSum, activeSystemSettings.roundWelfare);
    const roundedOtherSum = applyRounding(otherSum, activeSystemSettings.roundWelfare);

    const rawTotalRow = wages + roundedFoodSum + roundedTripSum + roundedOtherSum;
    const totalRow = applyRounding(rawTotalRow, activeSystemSettings.roundNetPay);

    totalDaysSum += credits;
    totalWagesSum += wages;
    totalFoodSum += roundedFoodSum;
    totalTripSum += roundedTripSum;
    totalOtherSum += roundedOtherSum;

    return {
      index: idx + 1,
      id: emp.id,
      name: emp.name,
      role: emp.role,
      credits,
      wages,
      foodSum: roundedFoodSum,
      tripSum: roundedTripSum,
      otherSum: roundedOtherSum,
      totalRow,
      isLocked,
    };
  });

  const grandTotal = totalWagesSum + totalFoodSum + totalTripSum + totalOtherSum;

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border border-slate-300 font-sans" id="print-area">
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide font-display">
            บริษัท บุรีรัมย์ บิลดิ้ง แอนด์ เทรดดิ้ง จำกัด
          </h1>
          <p className="text-[11px] text-slate-600 mt-1">
            สำนักงานใหญ่: 124 ถนนรอบเมืองบุรีรัมย์ ต.ในเมือง อ.เมืองบุรีรัมย์ จ.บุรีรัมย์ 31000
          </p>
          <p className="text-[11px] text-slate-600">โทร: 044-611-XXX | อีเมล: accounting@hrbtc.co.th</p>
        </div>
        <div className="text-right">
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
            ใบสรุปค่าแรงและต้นทุนโครงการ
          </h2>
          <p className="text-[9px] font-bold text-slate-500 mt-0.5">PROJECT LABOR COST SUMMARY REPORT</p>
          <p className="text-xs font-mono font-bold text-red-700 mt-2 bg-red-50 px-2.5 py-1 rounded inline-block">
            HRBTC-{dates[0]?.replace(/-/g, '') || 'REPORT'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-6 text-[11px]">
        <div className="space-y-1">
          <p>
            <span className="font-bold text-slate-700">ชื่อโครงการ:</span>{' '}
            <span className="font-extrabold text-slate-900 text-sm">{project}</span>
          </p>
          <p>
            <span className="font-bold text-slate-700">ขอบเขตรอบบัญชีงวดการจ่าย:</span>{' '}
            <span className="font-semibold text-slate-800">{billingMonthName} (26 ถึง 25)</span>
          </p>
        </div>
        <div className="text-right space-y-1">
          <p>
            <span className="font-bold text-slate-700">วันที่ประมวลผลข้อมูล:</span>{' '}
            <span className="font-semibold">
              {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </p>
          <p>
            <span className="font-bold text-slate-700">เจ้าหน้าที่ผู้จัดเตรียมรายงาน:</span>{' '}
            <span className="font-semibold text-slate-800">โฟร์แมนควบคุมไซด์งาน (ฝ่ายการเงินบุคคล HRBTC)</span>
          </p>
        </div>
      </div>

      <table className="min-w-full divide-y divide-slate-300 text-[10px] border border-slate-300">
        <thead className="bg-slate-50 text-[10px]">
          <tr>
            <th className="px-2 py-2.5 text-center font-bold border-r border-b border-slate-300">ลำดับ</th>
            <th className="px-2 py-2.5 text-left font-bold border-r border-b border-slate-300">รหัส</th>
            <th className="px-2 py-2.5 text-left font-bold border-r border-b border-slate-300">ชื่อ-นามสกุล</th>
            <th className="px-2 py-2.5 text-left font-bold border-r border-b border-slate-300">ตำแหน่ง</th>
            <th className="px-1.5 py-2.5 text-center font-bold border-r border-b border-slate-300">เครดิต (วัน)</th>
            <th className="px-2 py-2.5 text-right font-bold border-r border-b border-slate-300">ค่าแรงสะสม (+OT)</th>
            <th className="px-2 py-2.5 text-right font-bold border-r border-b border-slate-300">ค่าอาหารรวม</th>
            <th className="px-2 py-2.5 text-right font-bold border-r border-b border-slate-300">เบี้ยเที่ยว</th>
            <th className="px-2 py-2.5 text-right font-bold border-r border-b border-slate-300">สวัสดิการสปอนเซอร์</th>
            <th className="px-2.5 py-2.5 text-right font-bold border-b border-slate-300 bg-slate-100">รวมสุทธิ (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-2 py-2 text-center border-r border-slate-300 font-bold">{row.index}</td>
              <td className="px-2 py-2 border-r border-slate-300 font-mono text-[9px] font-bold">{row.id}</td>
              <td className="px-2 py-2 border-r border-slate-300 font-extrabold text-slate-900">{row.name}</td>
              <td className="px-2 py-2 border-r border-slate-300 text-slate-600 font-semibold">{row.role}</td>
              <td className="px-1.5 py-2 text-center border-r border-slate-300 font-extrabold text-slate-800">
                {row.isLocked ? <span className="text-red-650">LOCKED</span> : `${row.credits} วัน`}
              </td>
              <td className="px-2 py-2 text-right border-r border-slate-300 font-semibold">
                {row.isLocked ? '-' : `฿${row.wages.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
              </td>
              <td className="px-2 py-2 text-right border-r border-slate-300 font-semibold">
                ฿{row.foodSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-2 text-right border-r border-slate-300 font-semibold">
                ฿{row.tripSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-2 text-right border-r border-slate-300 font-semibold">
                ฿{row.otherSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-2.5 py-2 text-right font-extrabold text-red-900 bg-slate-100/40">
                {row.isLocked ? 'รอปลดล็อก' : `฿${row.totalRow.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-400 text-[10px]">
            <td colSpan={4} className="px-2 py-2.5 text-right font-black uppercase">
              ยอดสรุปสุทธิ (Project Grand Total)
            </td>
            <td className="px-1.5 py-2.5 text-center border-l border-slate-300 font-black">
              {totalDaysSum} วัน-แรง
            </td>
            <td className="px-2 py-2.5 text-right border-l border-slate-300 font-black">
              ฿{totalWagesSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-2 py-2.5 text-right border-l border-slate-300 font-black">
              ฿{totalFoodSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-2 py-2.5 text-right border-l border-slate-300 font-black">
              ฿{totalTripSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-2 py-2.5 text-right border-l border-slate-300 font-black">
              ฿{totalOtherSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-2.5 py-2.5 text-right text-xs text-red-900 font-black border-l border-slate-300 bg-red-50">
              ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-3 gap-8 mt-16 text-center text-[10px]">
        <div className="space-y-6">
          <p className="font-bold text-slate-800">ผู้รายงานยอด / โฟร์แมนหน้างาน</p>
          <div className="border-b border-slate-400 w-40 mx-auto h-8" />
          <p className="text-slate-500 font-semibold">(......................................................)</p>
        </div>
        <div className="space-y-6">
          <p className="font-bold text-slate-800">วิศวกรผู้ควบคุมโครงการ</p>
          <div className="border-b border-slate-400 w-40 mx-auto h-8" />
          <p className="text-slate-500 font-semibold">(......................................................)</p>
        </div>
        <div className="space-y-6">
          <p className="font-bold text-slate-800">ฝ่ายบัญชีและอนุมัติการสั่งจ่าย</p>
          <div className="border-b border-slate-400 w-40 mx-auto h-8" />
          <p className="text-slate-500 font-semibold">(......................................................)</p>
        </div>
      </div>

      <div className="mt-12 text-center text-[8px] text-slate-400 border-t border-slate-200 pt-4">
        * รายงานจัดทำผ่านระบบคลาวด์อัตโนมัติ BTC-Enterprise Time Costing Portal วันเวลาประมวลผล:{' '}
        {new Date().toLocaleString('th-TH')}
      </div>
    </div>
  );
}
