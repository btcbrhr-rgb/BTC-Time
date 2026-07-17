import { RAW_MAP } from '../data';

export interface ParsedTimesheetRow {
  id: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:MM or empty
  timeOut: string; // HH:MM or empty
  status: string; // W, L, etc.
}

export function parseTimesheetText(rawText: string): ParsedTimesheetRow[] {
  const lines = rawText.split('\n');
  const rows: ParsedTimesheetRow[] = [];
  
  const rawScannerLogs: Array<{ empId: string; date: string; time: string }> = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // 1. Check if it's the custom comma-separated format
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',');
      if (parts.length >= 2) {
        const empId = parts[0].trim();
        const date = parts[1].trim(); // expected YYYY-MM-DD
        const timeIn = parts[2] ? parts[2].trim() : '';
        const timeOut = parts[3] ? parts[3].trim() : '';
        const rawStatus = parts[4] ? parts[4].trim() : 'W';
        const status = RAW_MAP[rawStatus] || rawStatus;
        rows.push({ id: empId, date, timeIn, timeOut, status });
      }
    } else {
      // 2. Check if it's the raw site scanner format: "DD/MM/YYYY HH:MM:SS      EmployeeID"
      // Example: "  26/06/2026 7:43:37      800139"
      const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::\d{2})?\s+(\S+)$/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        const hour = match[4].padStart(2, '0');
        const minute = match[5].padStart(2, '0');
        const empId = match[6] || match[7] || '';

        const date = `${year}-${month}-${day}`;
        const time = `${hour}:${minute}`;

        rawScannerLogs.push({ empId, date, time });
      }
    }
  });

  // Group and process raw scanner logs
  if (rawScannerLogs.length > 0) {
    const groups: Record<string, { empId: string; date: string; times: string[] }> = {};

    rawScannerLogs.forEach((log) => {
      const key = `${log.empId}_${log.date}`;
      if (!groups[key]) {
        groups[key] = { empId: log.empId, date: log.date, times: [] };
      }
      groups[key].times.push(log.time);
    });

    Object.values(groups).forEach((group) => {
      // Sort times chronologically
      group.times.sort();
      
      // De-duplicate times
      const uniqueTimes = Array.from(new Set(group.times));
      
      let timeIn = '';
      let timeOut = '';
      let status = 'W';

      if (uniqueTimes.length === 1) {
        const time = uniqueTimes[0];
        const hour = parseInt(time.split(':')[0], 10);
        // Smart heuristic: morning scan means missed clock out, evening scan means missed clock in
        if (hour < 12) {
          timeIn = time;
          timeOut = '';
          status = 'MO';
        } else {
          timeIn = '';
          timeOut = time;
          status = 'MI';
        }
      } else if (uniqueTimes.length > 1) {
        const earliest = uniqueTimes[0];
        const latest = uniqueTimes[uniqueTimes.length - 1];

        // Parse earliest into minutes
        const [eH, eM] = earliest.split(':').map(Number);
        const earliestMin = eH * 60 + (eM || 0);

        // Parse latest into minutes
        const [lH, lM] = latest.split(':').map(Number);
        const latestMin = lH * 60 + (lM || 0);

        // Check the gap between earliest and latest
        if (latestMin - earliestMin < 240) {
          // Less than 4 hours gap: likely multiple double-taps at arrival or departure
          const firstHour = parseInt(earliest.split(':')[0], 10);
          if (firstHour < 12) {
            // All scans are close together in the morning -> Pick earliest check-in, set no check-out
            timeIn = earliest;
            timeOut = '';
            status = 'MO';
          } else {
            // All scans are close together in the afternoon/evening -> Pick latest check-out, set no check-in
            timeIn = '';
            timeOut = latest;
            status = 'MI';
          }
        } else {
          // 4 hours or more gap: genuine work shift!
          // Take the absolute earliest for timeIn, and the absolute latest for timeOut
          timeIn = earliest;
          timeOut = latest;
          status = 'W';
        }
      }

      rows.push({
        id: group.empId,
        date: group.date,
        timeIn,
        timeOut,
        status,
      });
    });
  }

  return rows;
}
