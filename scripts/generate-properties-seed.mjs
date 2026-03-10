import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import unsplashInteriorIds from '../src/data/unsplashInteriorIds.json' with { type: 'json' };

const DEFAULT_TOTAL = 8000;
const N = Number.parseInt(process.argv[2] || String(DEFAULT_TOTAL), 10);
const TOTAL = Number.isFinite(N) && N > 0 ? N : DEFAULT_TOTAL;

const CITY_CONFIG = [
  {
    city: 'دمشق',
    weight: 30,
    districts: ['المزة','المالكي','أبو رمانة','الشعلان','كفرسوسة','برزة','الميدان','ركن الدين','المهاجرين','الصالحية','باب توما','القابون','جرمانا (دمشق)','دمر','قدسيا (قرب دمشق)','مشروع دمر','الزاهرة','الحريقة','البرامكة'],
    ppsm: [8_000_000, 16_000_000],
    cap: 8_500_000_000,
  },
  {
    city: 'ريف دمشق',
    weight: 20,
    districts: ['جرمانا','صحنايا','كسوة','قطنا','الزبداني','التل','يبرود','النبك','دوما','حرستا','داريا','معضمية الشام','قدسيا','القطيفة','الضمير','عين ترما','سقبا','كفربطنا','حمورية'],
    ppsm: [4_000_000, 9_000_000],
    cap: 4_800_000_000,
  },
  {
    city: 'حلب',
    weight: 10,
    districts: ['الجميلية','الشارع الطويل','حلب الجديدة','الموكامبو','الأشرفية','السكري','سيف الدولة','الزهراء','الجامعة','صلاح الدين'],
    ppsm: [3_500_000, 8_000_000],
    cap: 4_200_000_000,
  },
  {
    city: 'حمص',
    weight: 8,
    districts: ['الوعر','عكرمة','الزهراء','الحمرا','الخالدية','بابا عمرو','الإنشاءات'],
    ppsm: [3_000_000, 7_000_000],
    cap: 3_500_000_000,
  },
  {
    city: 'اللاذقية',
    weight: 7,
    districts: ['الأميركان','مشروع الصليبة','الرمل الجنوبي','الزراعة','الدعتور','السكنتوري'],
    ppsm: [3_000_000, 7_000_000],
    cap: 3_600_000_000,
  },
  {
    city: 'طرطوس',
    weight: 6,
    districts: ['الكورنيش','بانياس','صافيتا','القدموس','الدريكيش'],
    ppsm: [3_000_000, 7_000_000],
    cap: 3_300_000_000,
  },
  {
    city: 'حماة',
    weight: 6,
    districts: ['الحاضر','القصور','المرابط','الصناعة','السوق','طريق حلب'],
    ppsm: [3_000_000, 7_000_000],
    cap: 3_300_000_000,
  },
  {
    city: 'إدلب',
    weight: 5,
    districts: ['إدلب المدينة','سراقب','أريحا','معرة النعمان','جسر الشغور'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_800_000_000,
  },
  {
    city: 'درعا',
    weight: 4,
    districts: ['درعا البلد','المحطة','طفس','الصنمين','ازرع'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_700_000_000,
  },
  {
    city: 'دير الزور',
    weight: 2,
    districts: ['الجورة','القصور','الحميدية','الميادين','البوكمال'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_600_000_000,
  },
  {
    city: 'الحسكة',
    weight: 1.5,
    districts: ['غويران','النشوة','المفتي','تل حجر','رأس العين'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_500_000_000,
  },
  {
    city: 'القامشلي',
    weight: 0.8,
    districts: ['الوسطى','قدور بك','الهلالية','حي العنترية'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_400_000_000,
  },
  {
    city: 'السويداء',
    weight: 0.7,
    districts: ['السويداء المدينة','شهبا','صلخد','القريا'],
    ppsm: [2_000_000, 5_500_000],
    cap: 2_400_000_000,
  },
];

const TYPE_CONFIG = {
  apartment: { ar: 'شقة', area: [70, 240], beds: [1, 4], baths: [1, 3], floor: [1, 12], modifier: [1.0, 1.22] },
  villa: { ar: 'فيلا', area: [220, 650], beds: [3, 7], baths: [3, 7], floor: [1, 3], modifier: [1.35, 1.8] },
  studio: { ar: 'استوديو', area: [35, 85], beds: [0, 1], baths: [1, 1], floor: [1, 12], modifier: [0.8, 0.95] },
  office: { ar: 'مكتب', area: [60, 320], beds: [0, 0], baths: [1, 3], floor: [1, 18], modifier: [1.1, 1.35] },
  shop: { ar: 'محل تجاري', area: [30, 160], beds: [0, 0], baths: [1, 2], floor: [0, 1], modifier: [1.1, 1.35] },
  land: { ar: 'أرض', area: [180, 1400], beds: [0, 0], baths: [0, 0], floor: [0, 0], modifier: [0.92, 1.2] },
};

const TYPE_WEIGHTS = [
  ['apartment', 47],
  ['villa', 15],
  ['studio', 10],
  ['office', 12],
  ['shop', 10],
  ['land', 6],
];

const ADJECTIVES = ['فاخر', 'حديث', 'واسع', 'مميز', 'راقي', 'عملي', 'هادئ', 'إطلالة مفتوحة', 'تشطيب ممتاز', 'تصميم عصري'];
const FEATURES = ['قريب من الخدمات', 'إضاءة طبيعية ممتازة', 'تشطيب سوبر ديلوكس', 'واجهات حديثة', 'مناسب للسكن العائلي', 'تشطيب أنيق', 'موقع حيوي', 'مناسب للاستثمار', 'تهوية ممتازة'];
const UNSPLASH_IDS = Array.isArray(unsplashInteriorIds) ? unsplashInteriorIds.filter(Boolean) : [];

const CITY_WEIGHT_SUM = CITY_CONFIG.reduce((sum, item) => sum + item.weight, 0);
const TYPE_WEIGHT_SUM = TYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function chance(p) {
  return Math.random() < p;
}

function pickWeightedCity() {
  let cursor = Math.random() * CITY_WEIGHT_SUM;
  for (const city of CITY_CONFIG) {
    cursor -= city.weight;
    if (cursor <= 0) return city;
  }
  return CITY_CONFIG[CITY_CONFIG.length - 1];
}

function pickType() {
  let cursor = Math.random() * TYPE_WEIGHT_SUM;
  for (const [type, weight] of TYPE_WEIGHTS) {
    cursor -= weight;
    if (cursor <= 0) return type;
  }
  return 'apartment';
}

function formatPriceLabel(value) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B SYP`;
  }
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return m >= 100 ? `${Math.round(m)}M SYP` : `${m.toFixed(0)}M SYP`;
  }
  return `${value.toLocaleString('en-US')} SYP`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildImages(seed) {
  if (!UNSPLASH_IDS.length) return [];
  const count = randInt(4, 8);
  const images = [];
  const step = 7;
  for (let i = 0; i < count; i += 1) {
    const id = UNSPLASH_IDS[(seed * 17 + i * step) % UNSPLASH_IDS.length];
    images.push(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`);
  }
  return images;
}

function createListing(index) {
  const cityCfg = pickWeightedCity();
  const type = pickType();
  const typeCfg = TYPE_CONFIG[type];
  const district = cityCfg.districts[randInt(0, cityCfg.districts.length - 1)];

  const area = randInt(typeCfg.area[0], typeCfg.area[1]);
  const bedrooms = randInt(typeCfg.beds[0], typeCfg.beds[1]);
  const bathrooms = randInt(typeCfg.baths[0], typeCfg.baths[1]);
  const floor = randInt(typeCfg.floor[0], typeCfg.floor[1]);

  const unitPrice = rand(cityCfg.ppsm[0], cityCfg.ppsm[1]);
  const typeModifier = rand(typeCfg.modifier[0], typeCfg.modifier[1]);
  const premiumModifier = chance(0.08) ? rand(1.05, 1.25) : 1;

  const rawPrice = Math.round(area * unitPrice * typeModifier * premiumModifier);
  const minPrice = cityCfg.city === 'دمشق' ? 350_000_000 : 120_000_000;
  const price = clamp(rawPrice, minPrice, cityCfg.cap);

  const adjective = ADJECTIVES[randInt(0, ADJECTIVES.length - 1)];
  const feature = FEATURES[randInt(0, FEATURES.length - 1)];
  const title = `${typeCfg.ar} ${adjective} في ${district}`;

  const createdAt = new Date(Date.now() - randInt(0, 720) * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: randomUUID(),
    title,
    description_ar: `${typeCfg.ar} ${adjective} ضمن منطقة ${district} في ${cityCfg.city}. المساحة ${area} م2 مع مواصفات عملية وتشطيبات عالية. ${feature}.`,
    city: cityCfg.city,
    district,
    type,
    area_m2: area,
    bedrooms,
    bathrooms,
    floor,
    furnished: chance(0.58),
    parking: chance(type === 'shop' ? 0.22 : 0.62),
    elevator: chance(type === 'land' ? 0.05 : 0.74),
    price_syp: price,
    price_label: formatPriceLabel(price),
    images: buildImages(index + 1),
    createdAt,
  };
}

async function main() {
  const rows = [];
  for (let i = 0; i < TOTAL; i += 1) {
    rows.push(createListing(i));
  }

  const outPath = resolve(process.cwd(), 'src/data/properties.seed.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(rows, null, 2), 'utf8');

  const byCity = rows.reduce((acc, row) => {
    acc[row.city] = (acc[row.city] || 0) + 1;
    return acc;
  }, {});

  console.log(`Generated ${rows.length} properties -> ${outPath}`);
  console.log('City distribution:', byCity);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
