export const NAV = [
  { group: '보건일지관리', items: [
    { path: 'logs', label: '보건일지' },
    { path: 'logs-print', label: '보건일지 일괄출력' },
  ] },
  { group: '학생관리', items: [
    { path: 'hospital', label: '병원치료등록' },
    { path: 'chronic', label: '요양호자등록' },
  ] },
  { group: '약품관리', items: [
    { path: 'purchases', label: '약품구입등록' },
    { path: 'ledger', label: '약품수불부' },
  ] },
  { group: '통계관리', items: [
    { path: 'stats-class', label: '학년반통계' },
    { path: 'stats-symptom', label: '증상분류통계' },
  ] },
  { group: '일정관리', items: [{ path: 'schedule', label: '일정등록/조회' }] },
  { group: '공통관리', items: [{ path: 'classes', label: '학년반등록' }] },
] as const
