// Sudan-specific reference data

export const EMERGENCY_NUMBERS = {
  police: '999',
  general: '112',
} as const;

export const COUNTRY_CODE = '+249';

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'ar';

export const SRID = 4326; // WGS84

export const RIVERS = ['Blue Nile', 'White Nile', 'River Nile', 'Atbara', 'Dinder', 'Rahad'] as const;
export type River = (typeof RIVERS)[number];

// Sudan's 18 states with ISO 3166-2:SD codes
export interface StateDefinition {
  code: string;
  name_en: string;
  name_ar: string;
  capital_en: string;
}

export const SUDAN_STATES: StateDefinition[] = [
  { code: 'KRT', name_en: 'Khartoum', name_ar: 'الخرطوم', capital_en: 'Khartoum' },
  { code: 'RNL', name_en: 'River Nile', name_ar: 'نهر النيل', capital_en: 'Ed Damer' },
  { code: 'WNL', name_en: 'White Nile', name_ar: 'النيل الأبيض', capital_en: 'Rabak' },
  { code: 'BNL', name_en: 'Blue Nile', name_ar: 'النيل الأزرق', capital_en: 'Ed Damazin' },
  { code: 'KSL', name_en: 'Kassala', name_ar: 'كسلا', capital_en: 'Kassala' },
  { code: 'GDR', name_en: 'Gedaref', name_ar: 'القضارف', capital_en: 'Gedaref' },
  { code: 'NKR', name_en: 'North Kordofan', name_ar: 'شمال كردفان', capital_en: 'El Obeid' },
  { code: 'SKR', name_en: 'South Kordofan', name_ar: 'جنوب كردفان', capital_en: 'Kadugli' },
  { code: 'WKR', name_en: 'West Kordofan', name_ar: 'غرب كردفان', capital_en: 'El Fula' },
  { code: 'NDR', name_en: 'North Darfur', name_ar: 'شمال دارفور', capital_en: 'El Fasher' },
  { code: 'SDR', name_en: 'South Darfur', name_ar: 'جنوب دارفور', capital_en: 'Nyala' },
  { code: 'WDR', name_en: 'West Darfur', name_ar: 'غرب دارفور', capital_en: 'El Geneina' },
  { code: 'CDR', name_en: 'Central Darfur', name_ar: 'وسط دارفور', capital_en: 'Zalingei' },
  { code: 'EDR', name_en: 'East Darfur', name_ar: 'شرق دارفور', capital_en: 'Ed Daein' },
  { code: 'NRT', name_en: 'Northern', name_ar: 'الشمالية', capital_en: 'Dongola' },
  { code: 'RDS', name_en: 'Red Sea', name_ar: 'البحر الأحمر', capital_en: 'Port Sudan' },
  { code: 'SNR', name_en: 'Sennar', name_ar: 'سنار', capital_en: 'Singa' },
  { code: 'GZR', name_en: 'Al Jazira', name_ar: 'الجزيرة', capital_en: 'Wad Madani' },
];

// Key localities per state (most flood-prone areas)
export interface LocalityDefinition {
  code: string;
  state_code: string;
  name_en: string;
  name_ar: string;
}

export const SUDAN_LOCALITIES: LocalityDefinition[] = [
  // Khartoum State
  { code: 'KRT-KRT', state_code: 'KRT', name_en: 'Khartoum', name_ar: 'الخرطوم' },
  { code: 'KRT-OMD', state_code: 'KRT', name_en: 'Omdurman', name_ar: 'أم درمان' },
  { code: 'KRT-BHR', state_code: 'KRT', name_en: 'Bahri (Khartoum North)', name_ar: 'بحري' },
  { code: 'KRT-JBL', state_code: 'KRT', name_en: 'Jebel Aulia', name_ar: 'جبل أولياء' },
  { code: 'KRT-SHR', state_code: 'KRT', name_en: 'Sharq El Nil', name_ar: 'شرق النيل' },
  { code: 'KRT-KRR', state_code: 'KRT', name_en: 'Karrari', name_ar: 'كرري' },
  { code: 'KRT-UMB', state_code: 'KRT', name_en: 'Umbada', name_ar: 'أمبدة' },
  // River Nile State
  { code: 'RNL-DMR', state_code: 'RNL', name_en: 'Ed Damer', name_ar: 'الدامر' },
  { code: 'RNL-ATB', state_code: 'RNL', name_en: 'Atbara', name_ar: 'عطبرة' },
  { code: 'RNL-SHN', state_code: 'RNL', name_en: 'Shendi', name_ar: 'شندي' },
  { code: 'RNL-BRB', state_code: 'RNL', name_en: 'Berber', name_ar: 'بربر' },
  { code: 'RNL-MRW', state_code: 'RNL', name_en: 'Meroe', name_ar: 'مروي' },
  { code: 'RNL-ADM', state_code: 'RNL', name_en: 'Abu Hamed', name_ar: 'أبو حمد' },
  // White Nile State
  { code: 'WNL-RBK', state_code: 'WNL', name_en: 'Rabak', name_ar: 'ربك' },
  { code: 'WNL-KST', state_code: 'WNL', name_en: 'Kosti', name_ar: 'كوستي' },
  { code: 'WNL-DWM', state_code: 'WNL', name_en: 'Ed Dueim', name_ar: 'الدويم' },
  { code: 'WNL-GUL', state_code: 'WNL', name_en: 'Guli', name_ar: 'قولي' },
  { code: 'WNL-TNJ', state_code: 'WNL', name_en: 'Tendalti', name_ar: 'تندلتي' },
  // Blue Nile State
  { code: 'BNL-DMZ', state_code: 'BNL', name_en: 'Ed Damazin', name_ar: 'الدمازين' },
  { code: 'BNL-RSR', state_code: 'BNL', name_en: 'Roseires', name_ar: 'الروصيرص' },
  { code: 'BNL-GIS', state_code: 'BNL', name_en: 'Geissan', name_ar: 'قيسان' },
  { code: 'BNL-WDE', state_code: 'BNL', name_en: 'Wad El Mahi', name_ar: 'ود الماحي' },
  // Kassala State
  { code: 'KSL-KSL', state_code: 'KSL', name_en: 'Kassala', name_ar: 'كسلا' },
  { code: 'KSL-HLF', state_code: 'KSL', name_en: 'Halfa El Jadida', name_ar: 'حلفا الجديدة' },
  { code: 'KSL-KHG', state_code: 'KSL', name_en: 'Khashm El Girba', name_ar: 'خشم القربة' },
  { code: 'KSL-HMK', state_code: 'KSL', name_en: 'Hamashkoreb', name_ar: 'همشكوريب' },
  // Gedaref State
  { code: 'GDR-GDR', state_code: 'GDR', name_en: 'Gedaref', name_ar: 'القضارف' },
  { code: 'GDR-FAS', state_code: 'GDR', name_en: 'El Fashaga', name_ar: 'الفشقة' },
  { code: 'GDR-GLB', state_code: 'GDR', name_en: 'Galabat', name_ar: 'قلابات' },
  { code: 'GDR-RHD', state_code: 'GDR', name_en: 'Rahad', name_ar: 'الرهد' },
  // North Kordofan
  { code: 'NKR-OBD', state_code: 'NKR', name_en: 'El Obeid', name_ar: 'الأبيض' },
  { code: 'NKR-BRA', state_code: 'NKR', name_en: 'Bara', name_ar: 'بارا' },
  { code: 'NKR-UMR', state_code: 'NKR', name_en: 'Um Ruwaba', name_ar: 'أم روابة' },
  // South Kordofan
  { code: 'SKR-KDG', state_code: 'SKR', name_en: 'Kadugli', name_ar: 'كادقلي' },
  { code: 'SKR-DLN', state_code: 'SKR', name_en: 'Dilling', name_ar: 'الدلنج' },
  { code: 'SKR-TLD', state_code: 'SKR', name_en: 'Talodi', name_ar: 'تلودي' },
  // West Kordofan
  { code: 'WKR-FUL', state_code: 'WKR', name_en: 'El Fula', name_ar: 'الفولة' },
  { code: 'WKR-MJD', state_code: 'WKR', name_en: 'Muglad', name_ar: 'المجلد' },
  // North Darfur
  { code: 'NDR-FSH', state_code: 'NDR', name_en: 'El Fasher', name_ar: 'الفاشر' },
  { code: 'NDR-KTM', state_code: 'NDR', name_en: 'Kutum', name_ar: 'كتم' },
  { code: 'NDR-MLT', state_code: 'NDR', name_en: 'Mellit', name_ar: 'مليط' },
  // South Darfur
  { code: 'SDR-NYL', state_code: 'SDR', name_en: 'Nyala', name_ar: 'نيالا' },
  { code: 'SDR-KAS', state_code: 'SDR', name_en: 'Kas', name_ar: 'كاس' },
  { code: 'SDR-BLI', state_code: 'SDR', name_en: 'Bielel', name_ar: 'بليل' },
  // West Darfur
  { code: 'WDR-GEN', state_code: 'WDR', name_en: 'El Geneina', name_ar: 'الجنينة' },
  { code: 'WDR-HAB', state_code: 'WDR', name_en: 'Habila', name_ar: 'هبيلة' },
  // Central Darfur
  { code: 'CDR-ZAL', state_code: 'CDR', name_en: 'Zalingei', name_ar: 'زالنجي' },
  { code: 'CDR-NRT', state_code: 'CDR', name_en: 'Nertiti', name_ar: 'نرتتي' },
  // East Darfur
  { code: 'EDR-DAN', state_code: 'EDR', name_en: 'Ed Daein', name_ar: 'الضعين' },
  { code: 'EDR-ADA', state_code: 'EDR', name_en: 'Adila', name_ar: 'عديلة' },
  // Northern State
  { code: 'NRT-DNG', state_code: 'NRT', name_en: 'Dongola', name_ar: 'دنقلا' },
  { code: 'NRT-MRW', state_code: 'NRT', name_en: 'Merowe', name_ar: 'مروي' },
  { code: 'NRT-WDH', state_code: 'NRT', name_en: 'Wadi Halfa', name_ar: 'وادي حلفا' },
  // Red Sea State
  { code: 'RDS-PSD', state_code: 'RDS', name_en: 'Port Sudan', name_ar: 'بورتسودان' },
  { code: 'RDS-SWK', state_code: 'RDS', name_en: 'Suakin', name_ar: 'سواكن' },
  { code: 'RDS-TOK', state_code: 'RDS', name_en: 'Tokar', name_ar: 'طوكر' },
  // Sennar State
  { code: 'SNR-SNG', state_code: 'SNR', name_en: 'Singa', name_ar: 'سنجة' },
  { code: 'SNR-SNR', state_code: 'SNR', name_en: 'Sennar', name_ar: 'سنار' },
  { code: 'SNR-DND', state_code: 'SNR', name_en: 'Dinder', name_ar: 'الدندر' },
  // Al Jazira State
  { code: 'GZR-WMD', state_code: 'GZR', name_en: 'Wad Madani', name_ar: 'ود مدني' },
  { code: 'GZR-HSH', state_code: 'GZR', name_en: 'Hasahisa', name_ar: 'حصاحيصا' },
  { code: 'GZR-KMN', state_code: 'GZR', name_en: 'Kamlin', name_ar: 'كاملين' },
  { code: 'GZR-MNG', state_code: 'GZR', name_en: 'Managil', name_ar: 'المناقل' },
  { code: 'GZR-MDF', state_code: 'GZR', name_en: 'Madani El Kubra', name_ar: 'مدني الكبرى' },
];
