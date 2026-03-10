import mysql from "mysql2/promise";

type CityConfig = {
  city: string;
  districts: string[];
  minPrice: number;
  maxPrice: number;
};

const TOTAL_ROWS = 3000;
const BATCH_SIZE = 100;

const CITIES: CityConfig[] = [
  {
    city: "Damascus",
    districts: [
      "Mazzeh",
      "Kafr Sousa",
      "Abu Rummaneh",
      "Malki",
      "Barzeh",
      "Dummar",
      "Rukn al-Din",
      "Muhajreen",
    ],
    minPrice: 400_000_000,
    maxPrice: 1_200_000_000,
  },
  {
    city: "Rural Damascus",
    districts: [
      "Jaramana",
      "Qudsaya",
      "Sayyida Zainab",
      "Darayya",
      "Harasta",
      "Douma",
      "Al-Tall",
      "Qatana",
    ],
    minPrice: 250_000_000,
    maxPrice: 700_000_000,
  },
  { city: "Aleppo", districts: ["Jdeideh", "Aziziyeh", "Salah al-Din", "Seif al-Dawla"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Homs", districts: ["Al-Waer", "Akrama", "Inshaat", "Al-Zahraa"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Hama", districts: ["Al-Qusour", "Al-Hader", "Al-Murabit", "Tariq Halab"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Latakia", districts: ["Al-Ziraa", "Daatour", "Sakantouri", "Project Sleibeh"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Tartous", districts: ["Corniche", "Baniyas", "Safita", "Dreikish"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Daraa", districts: ["Daraa Al-Balad", "Al-Mahatta", "Tafas", "Al-Sanamayn"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Deir ez-Zor", districts: ["Al-Joura", "Al-Qusour", "Al-Hamidiyah", "Al-Mayadin"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Idlib", districts: ["Idlib City", "Saraqib", "Ariha", "Jisr al-Shughur"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Al-Hasakah", districts: ["Ghuwayran", "Al-Nashwa", "Al-Mufti", "Tel Hajar"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "Qamishli", districts: ["Central", "Qadour Bek", "Al-Hilaliyah", "Al-Antariyah"], minPrice: 120_000_000, maxPrice: 400_000_000 },
  { city: "As-Suwayda", districts: ["Suwayda City", "Shahba", "Salkhad", "Al-Qurayya"], minPrice: 120_000_000, maxPrice: 400_000_000 },
];

const TYPES = ["APARTMENT", "HOUSE", "VILLA"] as const;

const TITLES = [
  "شقة فاخرة في حي راقي",
  "شقة حديثة مع إطلالة جميلة",
  "شقة مناسبة للعائلات",
  "منزل واسع بتشطيب ممتاز",
  "فيلا راقية بموقع هادئ",
  "عقار مميز قريب من الخدمات",
];

const DESCRIPTION =
  "شقة جميلة وهادئة في موقع مميز قريبة من جميع الخدمات، مناسبة للسكن العائلي.";

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

async function loadExistingUserIds(connection: mysql.Connection): Promise<number[]> {
  const tryTable = async (tableName: "user" | "User") => {
    const [rows] = await connection.query(`SELECT id FROM \`${tableName}\``);
    const ids = (rows as Array<{ id: number }>).map((row) => Number(row.id)).filter(Number.isFinite);
    return ids;
  };

  try {
    return await tryTable("user");
  } catch {
    try {
      return await tryTable("User");
    } catch {
      return [];
    }
  }
}

function generateOne(index: number, userIds: number[]) {
  const cityConfig = pick(CITIES);
  const district = pick(cityConfig.districts);
  const type = pick([...TYPES]);
  const area = randInt(60, 300);
  const ownerId = pick(userIds);
  const price = randInt(cityConfig.minPrice, cityConfig.maxPrice);
  const image = `${pick(IMAGE_POOL)}?auto=format&fit=crop&w=1200&q=80&sig=${index}`;

  return {
    ownerId,
    title: pick(TITLES),
    description: DESCRIPTION,
    address: `${district}, ${cityConfig.city}`,
    area,
    city: cityConfig.city,
    image,
    price,
    type,
  };
}

async function insertBatch(
  connection: mysql.Connection,
  rows: ReturnType<typeof generateOne>[],
) {
  if (!rows.length) return;

  const placeholders = rows
    .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())")
    .join(", ");
  const values: Array<string | number> = [];

  for (const row of rows) {
    values.push(
      row.ownerId,
      row.title,
      row.description,
      row.address,
      row.area,
      row.city,
      row.image,
      row.price,
      row.type,
    );
  }

  const sql = `
    INSERT INTO Property
    (ownerId, title, description, address, area, city, image, price, type, createdAt, updatedAt)
    VALUES ${placeholders}
  `;

  await connection.execute(sql, values);
}

async function main() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "housing_db",
  });

  try {
    const userIds = await loadExistingUserIds(connection);
    if (!userIds.length) {
      throw new Error(
        "No users found in `user` table. Create at least one user first, then re-run seed:properties.",
      );
    }
    console.log(`Found ${userIds.length} users. Using existing user IDs for ownerId.`);

    let inserted = 0;
    for (let i = 0; i < TOTAL_ROWS; i += BATCH_SIZE) {
      const size = Math.min(BATCH_SIZE, TOTAL_ROWS - i);
      const rows = Array.from({ length: size }, (_, idx) => generateOne(i + idx + 1, userIds));
      await insertBatch(connection, rows);
      inserted += rows.length;
      console.log(`Inserted ${inserted}/${TOTAL_ROWS}`);
    }
    console.log("Seeding complete.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
