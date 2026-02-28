/**
 * Bilingual SMS templates for disaster alerts
 */

export const SMS_TEMPLATES = {
  weather_alert: {
    en: (params: { alertType: string; severity: string; area: string }) =>
      `[SudanFlood] ${params.severity.toUpperCase()} ${params.alertType}: Alert for ${params.area}. Stay safe and follow official guidance.`,
    ar: (params: { alertType: string; severity: string; area: string }) =>
      `[فيضانات السودان] تنبيه ${params.severity} - ${params.alertType}: تنبيه لمنطقة ${params.area}. ابقَ آمناً واتبع التوجيهات الرسمية.`,
  },
  rescue_dispatch: {
    en: (params: { operationCode: string; location: string }) =>
      `[SudanFlood] Rescue operation ${params.operationCode} dispatched to ${params.location}. Help is on the way.`,
    ar: (params: { operationCode: string; location: string }) =>
      `[فيضانات السودان] تم إرسال عملية إنقاذ ${params.operationCode} إلى ${params.location}. المساعدة في الطريق.`,
  },
  shelter_update: {
    en: (params: { shelterName: string; status: string }) =>
      `[SudanFlood] Shelter "${params.shelterName}" status: ${params.status}. Check dashboard for details.`,
    ar: (params: { shelterName: string; status: string }) =>
      `[فيضانات السودان] حالة مركز الإيواء "${params.shelterName}": ${params.status}. تحقق من لوحة المعلومات للتفاصيل.`,
  },
} as const;
