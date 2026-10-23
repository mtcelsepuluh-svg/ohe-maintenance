/**
 * Value Time Activities Data
 * Data aktivitas Value Time untuk OHE MTC
 */

const valueTimeActivities = [
  // CORRECTIVE - Perbaikan Setting & Mekanikal
  {
    activity_code: 'VT-COR-001',
    activity_name: 'Perbaikan setting pisau',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 30,
    unit: 'minutes',
    description: 'Perbaikan dan setting pisau mesin',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-002',
    activity_name: 'Perbaikan Pisau dengan menganti pisau',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Mengganti pisau yang aus/rusak',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-003',
    activity_name: 'Perbaikan Roll Mesin Genteng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan roll pada mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-004',
    activity_name: 'Perbaikan setting dies',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 40,
    unit: 'minutes',
    description: 'Setting dan perbaikan dies mesin',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-005',
    activity_name: 'Perbaikan hidrolik cutter',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 50,
    unit: 'minutes',
    description: 'Perbaikan sistem hidrolik cutter',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-006',
    activity_name: 'Perbaikan / ganti dies dengan overhaule',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 120,
    unit: 'minutes',
    description: 'Overhaul dies mesin',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-007',
    activity_name: 'Perbaikan hidrolik press Mesin Genteng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan hidrolik press pada mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-008',
    activity_name: 'Perbaikan produk cacat di mesin genteng( lecet/penyok dll )',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 30,
    unit: 'minutes',
    description: 'Perbaikan produk yang cacat (lecet, penyok, dll)',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-009',
    activity_name: 'Perbaikan Stacker',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan mesin stacker',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-010',
    activity_name: 'Perbaikan Pisau Mesin Truss / Reng / Purlin',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 40,
    unit: 'minutes',
    description: 'Perbaikan pisau mesin truss, reng, purlin',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-011',
    activity_name: 'Setting roll mesin Purlin / truss /reng / Holo',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 35,
    unit: 'minutes',
    description: 'Setting roll pada mesin purlin, truss, reng, holo',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-012',
    activity_name: 'Perbaikan produk cacat di mesin truss/ reng/ purlin / holo',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 30,
    unit: 'minutes',
    description: 'Perbaikan produk cacat pada mesin truss, reng, purlin, holo',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-013',
    activity_name: 'Perbaikan Decoiler',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 50,
    unit: 'minutes',
    description: 'Perbaikan mesin decoiler',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-014',
    activity_name: 'Perbaikan mesin Press',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan mesin press',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-015',
    activity_name: 'Perbaikan mesin SH',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan mesin SH',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-016',
    activity_name: 'Perbaikan mesin ST',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan mesin ST',
    status: 'active'
  },

  // CORRECTIVE - Elektrik
  {
    activity_code: 'VT-COR-017',
    activity_name: 'Perbaikan Elektrik mesin Genteng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan sistem elektrik mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-018',
    activity_name: 'Perbaikan Elektrik Decoiler mesin Genteng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan elektrik decoiler mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-019',
    activity_name: 'Perbaikan Elektrik Stacker Genteng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan elektrik stacker mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-020',
    activity_name: 'Perbaikan Motor Mesin dan Decoiler',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 90,
    unit: 'minutes',
    description: 'Perbaikan motor mesin dan decoiler',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-021',
    activity_name: 'Perbaikan Jalur kabel Listrik',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan jalur kabel listrik',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-022',
    activity_name: 'Perbaikan Jalur CCTV',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan jalur CCTV',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-023',
    activity_name: 'Perbaikan Jalur LAN',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan jalur LAN',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-024',
    activity_name: 'Perbaikan Otomatisasi Cap',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan sistem otomatisasi cap',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-025',
    activity_name: 'Perbaikan Elektrik Crane',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan sistem elektrik crane',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-026',
    activity_name: 'Perbaikan Panel -panel Listrik',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 75,
    unit: 'minutes',
    description: 'Perbaikan panel-panel listrik',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-027',
    activity_name: 'Perbaikan Mesin Wrapping',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 50,
    unit: 'minutes',
    description: 'Perbaikan mesin wrapping',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-028',
    activity_name: 'Repair IN4',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Repair IN4',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-029',
    activity_name: 'Perbaikan Elektrik Mesin Truss / Reng / Purlin / Holo/Slitting',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan elektrik mesin truss, reng, purlin, holo, slitting',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-030',
    activity_name: 'Perbaikan Elektrik stacker mesin truss/ reng',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan elektrik stacker mesin truss/reng',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-031',
    activity_name: 'Perbaikan Troley',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 40,
    unit: 'minutes',
    description: 'Perbaikan troley',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-032',
    activity_name: 'Perbaikan Elektrik mesin Press',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan elektrik mesin press',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-033',
    activity_name: 'Perbaikan Elektrik mesin SH',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan elektrik mesin SH',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-034',
    activity_name: 'Perbaikan Elektrik mesin ST',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan elektrik mesin ST',
    status: 'active'
  },

  // CORRECTIVE - Fasilitas & Utilitas
  {
    activity_code: 'VT-COR-035',
    activity_name: 'Perbaikan Pintu gerbang',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan pintu gerbang',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-036',
    activity_name: 'Perbaikan Jalur Pipa Air',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan jalur pipa air',
    status: 'active'
  },

  // CORRECTIVE - Forklift
  {
    activity_code: 'VT-COR-037',
    activity_name: 'Perbaikan Power Steering Forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan power steering forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-038',
    activity_name: 'Perbaikan Tilt Hidrolik Forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan tilt hidrolik forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-039',
    activity_name: 'Perbaikan Aki Forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan aki forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-040',
    activity_name: 'Perbaikan Roda / pengereman Forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan roda/pengereman forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-041',
    activity_name: 'Perbaikan radiator forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 50,
    unit: 'minutes',
    description: 'Perbaikan radiator forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-042',
    activity_name: 'Perbaikan persneling forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 90,
    unit: 'minutes',
    description: 'Perbaikan persneling forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-043',
    activity_name: 'Perbaikan forklift dengan overhaule',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 240,
    unit: 'minutes',
    description: 'Overhaul forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-044',
    activity_name: 'Perbaikan pompa solar forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan pompa solar forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-045',
    activity_name: 'Perbaikan elektrik / kelistrikan forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan elektrik/kelistrikan forklift',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-046',
    activity_name: 'Perbaikan lampu forklift',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 30,
    unit: 'minutes',
    description: 'Perbaikan lampu forklift',
    status: 'active'
  },

  // CORRECTIVE - Kendaraan
  {
    activity_code: 'VT-COR-047',
    activity_name: 'Perbaikan bus',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 120,
    unit: 'minutes',
    description: 'Perbaikan bus',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-048',
    activity_name: 'Perbaikan Power stering dan hidrolik truck fuso',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 90,
    unit: 'minutes',
    description: 'Perbaikan power steering dan hidrolik truck fuso',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-049',
    activity_name: 'Perbaikan elektrik / kelistrikan truck fuso',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan elektrik/kelistrikan truck fuso',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-050',
    activity_name: 'Perbaikan mekanikal truck fuso',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 90,
    unit: 'minutes',
    description: 'Perbaikan mekanikal truck fuso',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-051',
    activity_name: 'Perbaikan Motor tiga roda',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 60,
    unit: 'minutes',
    description: 'Perbaikan motor tiga roda',
    status: 'active'
  },

  // CORRECTIVE - Alat & Equipment
  {
    activity_code: 'VT-COR-052',
    activity_name: 'Perbaikan Stamper / alat - alat proyek',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 45,
    unit: 'minutes',
    description: 'Perbaikan stamper dan alat-alat proyek',
    status: 'active'
  },
  {
    activity_code: 'VT-COR-053',
    activity_name: 'Perbaikan hand pallet dll',
    category: 'VALUE TIME',
    sub_category: 'Corrective',
    standard_time: 40,
    unit: 'minutes',
    description: 'Perbaikan hand pallet dan equipment lainnya',
    status: 'active'
  },

  // PREVENTIVE
  {
    activity_code: 'VT-PRE-001',
    activity_name: 'Inspeksi Harian',
    category: 'VALUE TIME',
    sub_category: 'Preventive',
    standard_time: 30,
    unit: 'minutes',
    description: 'Inspeksi harian mesin dan equipment',
    status: 'active'
  },
  {
    activity_code: 'VT-PRE-002',
    activity_name: 'Preventive Maintenance',
    category: 'VALUE TIME',
    sub_category: 'Preventive',
    standard_time: 60,
    unit: 'minutes',
    description: 'Preventive maintenance rutin',
    status: 'active'
  },
  {
    activity_code: 'VT-PRE-003',
    activity_name: 'Taging Elektrik',
    category: 'VALUE TIME',
    sub_category: 'Preventive',
    standard_time: 45,
    unit: 'minutes',
    description: 'Taging/thermography elektrik',
    status: 'active'
  },

  // PEKERJAAN PROYEK MTC
  {
    activity_code: 'VT-PRJ-001',
    activity_name: 'Repair dies di workshop',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 90,
    unit: 'minutes',
    description: 'Repair dies di workshop',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-002',
    activity_name: 'Stock Opname',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 120,
    unit: 'minutes',
    description: 'Stock opname spare parts dan material',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-003',
    activity_name: 'Memantau trial coil / produk baru',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 60,
    unit: 'minutes',
    description: 'Memantau trial coil atau produk baru',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-004',
    activity_name: 'Pembuatan / Repair Roll Mesin Genteng',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 180,
    unit: 'minutes',
    description: 'Pembuatan atau repair roll mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-005',
    activity_name: 'Perbaikan dies Mesin genteng',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 120,
    unit: 'minutes',
    description: 'Perbaikan dies mesin genteng',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-006',
    activity_name: 'Pembuatan Dies Baru',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 240,
    unit: 'minutes',
    description: 'Pembuatan dies baru',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-007',
    activity_name: 'Pembuatan alat muat baru',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 180,
    unit: 'minutes',
    description: 'Pembuatan alat muat baru',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-008',
    activity_name: 'Pembuatan cap dari bawah',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 150,
    unit: 'minutes',
    description: 'Pembuatan cap dari bawah',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-009',
    activity_name: 'Pembuatan alat untuk mesin pilo',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 120,
    unit: 'minutes',
    description: 'Pembuatan alat untuk mesin pilo',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-010',
    activity_name: 'Pembuatan roll mesin truss / reng / purlin / holo',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 240,
    unit: 'minutes',
    description: 'Pembuatan roll mesin truss, reng, purlin, holo',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-011',
    activity_name: 'Pembuatan roll mesin L01',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 180,
    unit: 'minutes',
    description: 'Pembuatan roll mesin L01',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-012',
    activity_name: 'Pembuatan peralatan dan aksesoris mesin',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 150,
    unit: 'minutes',
    description: 'Pembuatan peralatan dan aksesoris mesin',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-013',
    activity_name: 'Membantu instalasi mesin baru',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 480,
    unit: 'minutes',
    description: 'Membantu instalasi mesin baru',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-014',
    activity_name: 'Pembuatan alat bantu mesin / prod L08',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 180,
    unit: 'minutes',
    description: 'Pembuatan alat bantu mesin/produksi L08',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-015',
    activity_name: 'Pembuatan roll dan peralatan mesin cibitung',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 240,
    unit: 'minutes',
    description: 'Pembuatan roll dan peralatan mesin cibitung',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-016',
    activity_name: 'Pembuatan roll dan peralatan mesin EUP',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 240,
    unit: 'minutes',
    description: 'Pembuatan roll dan peralatan mesin EUP',
    status: 'active'
  },
  {
    activity_code: 'VT-PRJ-017',
    activity_name: 'Pembuatan roll dan peralatan mesin Tatametal',
    category: 'VALUE TIME',
    sub_category: 'Pekerjaan Proyek MTC',
    standard_time: 240,
    unit: 'minutes',
    description: 'Pembuatan roll dan peralatan mesin Tatametal',
    status: 'active'
  }
];

module.exports = valueTimeActivities;
