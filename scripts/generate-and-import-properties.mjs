import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_TOTAL = 3000;
const BATCH_SIZE = 300;
const N = Number.parseInt(process.argv[2] || String(DEFAULT_TOTAL), 10);
const TOTAL = Number.isFinite(N) && N > 0 ? N : DEFAULT_TOTAL;

const CITY_CONFIG = [
  {
    city: 'دمشق',
    weight: 30,
    districts: ['المزة','المالكي','أبو رمانة','الشعلان','كفرسوسة','برزة','الميدان','ركن الدين','المهاجرين','الصالحية','باب توما','القابون','جرمانا (دمشق)','دمر','قدسيا (قرب دمشق)','مشروع دمر','الزاهرة','الحريقة','البرامكة'],
    ppsm: [6_000_000, 12_000_000],
  },
  {
    city: 'ريف دمشق',
    weight: 20,
    districts: ['جرمانا','صحنايا','كسوة','قطنا','الزبداني','التل','يبرود','النبك','دوما','حرستا','داريا','معضمية الشام','قدسيا','القطيفة','الضمير','عين ترما','سقبا','كفربطنا','حمورية'],
    ppsm: [3_000_000, 7_000_000],
  },
  {
    city: 'حلب',
    weight: 10,
    districts: ['الجميلية','الشارع الطويل','حلب الجديدة','الموكامبو','الأشرفية','السكري','سيف الدولة','الزهراء','الجامعة','صلاح الدين'],
    ppsm: [2_800_000, 6_500_000],
  },
  {
    city: 'حمص',
    weight: 8,
    districts: ['الوعر','عكرمة','الزهراء','الحمرا','الخالدية','بابا عمرو','الإنشاءات'],
    ppsm: [2_500_000, 6_000_000],
  },
  {
    city: 'اللاذقية',
    weight: 7,
    districts: ['الأميركان','مشروع الصليبة','الرمل الجنوبي','الزراعة','الدعتور','السكنتوري'],
    ppsm: [2_500_000, 6_000_000],
  },
  {
    city: 'طرطوس',
    weight: 6,
    districts: ['الكورنيش','بانياس','صافيتا','القدموس','الدريكيش'],
    ppsm: [2_500_000, 6_000_000],
  },
  {
    city: 'حماة',
    weight: 6,
    districts: ['الحاضر','القصور','المرابط','الصناعة','السوق','طريق حلب'],
    ppsm: [2_500_000, 6_000_000],
  },
  {
    city: 'إدلب',
    weight: 5,
    districts: ['إدلب المدينة','سراقب','أريحا','معرة النعمان','جسر الشغور'],
    ppsm: [2_000_000, 5_000_000],
  },
  {
    city: 'درعا',
    weight: 4,
    districts: ['درعا البلد','المحطة','طفس','الصنمين','ازرع'],
    ppsm: [2_000_000, 5_000_000],
  },
  {
    city: 'دير الزور',
    weight: 2,
    districts: ['الجورة','القصور','الحميدية','الميادين','البوكمال'],
    ppsm: [2_000_000, 5_000_000],
  },
  {
    city: 'الحسكة',
    weight: 1.5,
    districts: ['غويران','النشوة','المفتي','تل حجر','رأس العين'],
    ppsm: [2_000_000, 5_000_000],
  },
  {
    city: 'القامشلي',
    weight: 0.8,
    districts: ['الوسطى','قدور بك','الهلالية','حي العنترية'],
    ppsm: [2_000_000, 5_000_000],
  },
  {
    city: 'السويداء',
    weight: 0.7,
    districts: ['السويداء المدينة','شهبا','صلخد','القريا'],
    ppsm: [2_000_000, 5_000_000],
  },
];

const TYPE_CONFIG = {
  apartment: { ar: 'شقة', area: [70, 220], bedrooms: [1, 4], bathrooms: [1, 3], modifier: [1.0, 1.15] },
  villa: { ar: 'فيلا', area: [220, 650], bedrooms: [3, 7], bathrooms: [2, 6], modifier: [1.35, 1.8] },
  studio: { ar: 'استوديو', area: [35, 85], bedrooms: [0, 1], bathrooms: [1, 1], modifier: [0.8, 0.9] },
  office: { ar: 'مكتب', area: [60, 320], bedrooms: [0, 1], bathrooms: [1, 3], modifier: [1.1, 1.35] },
  shop: { ar: 'محل', area: [30, 160], bedrooms: [0, 0], bathrooms: [1, 2], modifier: [1.1, 1.35] },
  land: { ar: 'أرض', area: [180, 1200], bedrooms: [0, 0], bathrooms: [0, 0], modifier: [0.9, 1.15] },
};

const TYPE_WEIGHTS = [
  ['apartment', 48],
  ['villa', 14],
  ['studio', 10],
  ['office', 12],
  ['shop', 10],
  ['land', 6],
];

const ADJECTIVES = ['فاخر', 'حديث', 'واسع', 'مميز', 'راقي', 'هادئ', 'تشطيب ممتاز', 'تصميم عصري'];
const FEATURES = ['قريب من الخدمات', 'إضاءة طبيعية ممتازة', 'موقع حيوي', 'مناسب للاستثمار', 'تشطيبات أنيقة'];

const CAPTION_POOL = {
  LIVING: ['غرفة جلوس واسعة بإضاءة طبيعية وتشطيب حديث', 'صالون مريح بتوزيع عملي ومساحات رحبة'],
  KITCHEN: ['مطبخ راكب حديث مع خزائن وتجهيزات عملية', 'مطبخ أنيق بتفاصيل حديثة ومساحة عمل جيدة'],
  BEDROOM: ['غرفة نوم هادئة مع مساحة تخزين جيدة', 'غرفة نوم مريحة بإضاءة هادئة وتشطيب مرتب'],
  BATHROOM: ['حمّام حديث بتشطيبات نظيفة وتهوية جيدة', 'حمّام عملي مع تجهيزات جيدة وصيانة ممتازة'],
  DINING: ['مساحة طعام مناسبة للعائلة مع توزيع عملي', 'ركن طعام بتصميم عصري وإضاءة جميلة'],
  BALCONY: ['بلكون بإطلالة مفتوحة ومساحة جلسة', 'شرفة خارجية مناسبة للجلسات اليومية'],
  EXTERIOR: ['واجهة البناء ومدخل أنيق', 'الواجهة الخارجية بتصميم حديث ومظهر مرتب'],
};

const CITY_WEIGHT_SUM = CITY_CONFIG.reduce((s, c) => s + c.weight, 0);
const TYPE_WEIGHT_SUM = TYPE_WEIGHTS.reduce((s, [, w]) => s + w, 0);

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

function pickOne(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function buildImageUrl(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
}

function normalizeDbPort(v) {
  const p = Number.parseInt(String(v || '3306'), 10);
  return Number.isFinite(p) ? p : 3306;
}

async function loadRoomIds() {
  const path = resolve(process.cwd(), 'scripts/data/unsplash_ids_by_room.json');
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

function generateRoomImages({ bedrooms, roomIds, seedOffset }) {
  const images = [];
  let sortOrder = 0;

  const pushRoomImage = (room, count = 1) => {
    const ids = roomIds[room] || [];
    if (!ids.length) return;
    for (let i = 0; i < count; i += 1) {
      const id = ids[(seedOffset * 31 + sortOrder * 17 + i) % ids.length];
      images.push({
        room,
        url: buildImageUrl(id),
        caption: pickOne(CAPTION_POOL[room] || CAPTION_POOL.LIVING),
        sortOrder,
      });
      sortOrder += 1;
    }
  };

  pushRoomImage('LIVING', randInt(1, 2));
  pushRoomImage('KITCHEN', 1);
  pushRoomImage('BATHROOM', 1);

  const bedroomCount = bedrooms <= 0 ? 1 : Math.min(4, bedrooms);
  pushRoomImage('BEDROOM', bedroomCount);

  if (chance(0.2)) pushRoomImage('DINING', 1);
  if (chance(0.3)) pushRoomImage('BALCONY', 1);
  if (chance(0.4)) pushRoomImage('EXTERIOR', 1);

  while (images.length < 4) {
    pushRoomImage('LIVING', 1);
  }

  return images;
}

function generateRows(total, roomIds, storeFullSypPrice) {
  const rows = [];
  const uniqueness = new Set();

  while (rows.length < total) {
    const idx = rows.length + 1;
    const cityCfg = pickWeightedCity();
    const district = pickOne(cityCfg.districts);

    const type = pickType();
    const typeCfg = TYPE_CONFIG[type];

    const area = randInt(typeCfg.area[0], typeCfg.area[1]);
    const bedrooms = randInt(typeCfg.bedrooms[0], typeCfg.bedrooms[1]);
    const bathrooms = randInt(typeCfg.bathrooms[0], typeCfg.bathrooms[1]);

    const ppsm = rand(cityCfg.ppsm[0], cityCfg.ppsm[1]);
    const typeModifier = rand(typeCfg.modifier[0], typeCfg.modifier[1]);
    const premiumModifier = chance(0.06) ? rand(1.05, 1.2) : 1;
    const priceSyp = Math.round(area * ppsm * typeModifier * premiumModifier);

    const adjective = pickOne(ADJECTIVES);
    const feature = pickOne(FEATURES);
    const title = `${typeCfg.ar} ${adjective} في ${district}`;
    const address = `${district}، ${cityCfg.city}`;

    const ownerId = randInt(1, 80);
    const uniqueKey = `${ownerId}::${title}::${address}`;
    if (uniqueness.has(uniqueKey)) continue;
    uniqueness.add(uniqueKey);

    const images = generateRoomImages({ bedrooms, roomIds, seedOffset: idx });
    const thumbnail =
      images.find((x) => x.room === 'LIVING')?.url ||
      images[0]?.url ||
      buildImageUrl((roomIds.LIVING || [])[0] || '1502672260266-1c1ef2d93688');

    const createdAt = new Date(Date.now() - randInt(0, 900) * 24 * 60 * 60 * 1000);
    const description = `${typeCfg.ar} ${adjective} ضمن منطقة ${district} في ${cityCfg.city}. المساحة ${area} م2 مع ${bedrooms} غرف نوم و${bathrooms} حمامات. ${feature}.`;

    rows.push({
      ownerId,
      title,
      description,
      address,
      area,
      city: cityCfg.city,
      image: thumbnail,
      price: storeFullSypPrice ? priceSyp : Math.max(1, Math.round(priceSyp / 1_000_000)),
      type,
      createdAt,
      updatedAt: createdAt,
      images,
      priceSyp,
    });
  }

  return rows;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function assertPropertyImageTableExists(conn, schemaName) {
  const [rows] = await conn.execute(
    `SELECT 1
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'PropertyImage'
     LIMIT 1`,
    [schemaName],
  );

  if (!rows.length) {
    throw new Error('PropertyImage table missing. Run the SQL migration first.');
  }
}

async function detectPriceStorageMode(conn, schemaName) {
  const [rows] = await conn.execute(
    `SELECT DATA_TYPE, COLUMN_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Property' AND COLUMN_NAME = 'price'
     LIMIT 1`,
    [schemaName],
  );

  if (!rows.length) {
    throw new Error('Property.price column not found.');
  }

  const dataType = String(rows[0].DATA_TYPE || '').toLowerCase();
  return dataType === 'bigint';
}

async function insertBatch(conn, rows) {
  let inserted = 0;
  let updated = 0;
  let imagesInserted = 0;

  await conn.beginTransaction();
  try {
    for (const row of rows) {
      const [existingRows] = await conn.execute(
        `SELECT id FROM \`Property\` WHERE ownerId = ? AND title = ? AND address = ? LIMIT 1`,
        [row.ownerId, row.title, row.address],
      );

      let propertyId;
      if (existingRows.length) {
        propertyId = existingRows[0].id;
        await conn.execute(
          `UPDATE \`Property\`
           SET description = ?, area = ?, city = ?, image = ?, price = ?, type = ?, updatedAt = ?
           WHERE id = ?`,
          [row.description, row.area, row.city, row.image, row.price, row.type, new Date(), propertyId],
        );
        updated += 1;
      } else {
        const [insertRes] = await conn.execute(
          `INSERT INTO \`Property\`
           (ownerId, title, description, address, area, city, image, price, type, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.ownerId,
            row.title,
            row.description,
            row.address,
            row.area,
            row.city,
            row.image,
            row.price,
            row.type,
            row.createdAt,
            row.updatedAt,
          ],
        );
        propertyId = insertRes.insertId;
        inserted += 1;
      }

      await conn.execute(`DELETE FROM \`PropertyImage\` WHERE propertyId = ?`, [propertyId]);

      if (row.images.length) {
        const values = [];
        const placeholders = row.images
          .map((img) => {
            values.push(propertyId, img.url, img.room, img.caption, img.sortOrder, new Date(), new Date());
            return '(?, ?, ?, ?, ?, ?, ?)';
          })
          .join(', ');

        await conn.execute(
          `INSERT INTO \`PropertyImage\` (propertyId, url, room, caption, sortOrder, createdAt, updatedAt)
           VALUES ${placeholders}`,
          values,
        );
        imagesInserted += row.images.length;
      }
    }

    await conn.commit();
    return { inserted, updated, imagesInserted };
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

async function main() {
  let mysql;
  try {
    mysql = await import('mysql2/promise');
  } catch {
    console.error('Missing dependency: mysql2. Install it with: npm i mysql2');
    process.exit(1);
  }

  const host = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
  const port = normalizeDbPort(process.env.DB_PORT || process.env.MYSQL_PORT || '3306');
  const user = process.env.DB_USER || process.env.MYSQL_USER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'housing_db';

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 6,
    charset: 'utf8mb4',
  });

  const conn = await pool.getConnection();
  try {
    console.log('Open phpMyAdmin -> housing_db -> SQL -> paste and run scripts/sql/2026_create_property_images.sql before running npm run props:seed');
    await assertPropertyImageTableExists(conn, database);
    const storeFullSypPrice = await detectPriceStorageMode(conn, database);
    const roomIds = await loadRoomIds();
    const generated = generateRows(TOTAL, roomIds, storeFullSypPrice);
    const batches = chunk(generated, BATCH_SIZE);

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalImages = 0;

    for (let i = 0; i < batches.length; i += 1) {
      const result = await insertBatch(conn, batches[i]);
      totalInserted += result.inserted;
      totalUpdated += result.updated;
      totalImages += result.imagesInserted;
      console.log(`Batch ${i + 1}/${batches.length} -> inserted: ${result.inserted}, updated: ${result.updated}, images: ${result.imagesInserted}`);
    }

    console.log('---');
    console.log(`Done. Generated: ${generated.length}`);
    console.log(`Inserted properties: ${totalInserted}`);
    console.log(`Updated properties: ${totalUpdated}`);
    console.log(`Inserted property images: ${totalImages}`);
    console.log(`Price mode: ${storeFullSypPrice ? 'full SYP in Property.price' : 'millions SYP in Property.price'}`);
    console.log('Verification SQL:');
    console.log('SELECT COUNT(*) AS properties_count FROM Property;');
    console.log('SELECT COUNT(*) AS property_images_count FROM PropertyImage;');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
