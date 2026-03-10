import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

type Room = "LIVING" | "KITCHEN" | "BATHROOM" | "BEDROOM" | "EXTERIOR" | "BALCONY";

type RoomLibrary = Record<Room, string[]>;

type PropertyRow = { id: number };

const ROOM_LABELS_AR: Record<Room, string> = {
  LIVING: "غرفة معيشة",
  KITCHEN: "مطبخ",
  BATHROOM: "حمام",
  BEDROOM: "غرفة نوم",
  EXTERIOR: "واجهة خارجية",
  BALCONY: "شرفة",
};

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "housing_db",
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

async function loadRoomImages(): Promise<RoomLibrary> {
  const filePath = resolve(process.cwd(), "scripts/assets/room_images.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as RoomLibrary;

  const requiredRooms: Room[] = ["LIVING", "KITCHEN", "BATHROOM", "BEDROOM", "EXTERIOR", "BALCONY"];
  for (const room of requiredRooms) {
    if (!Array.isArray(parsed[room]) || parsed[room].length < 30) {
      throw new Error(`room_images.json must contain at least 30 URLs for room ${room}`);
    }
  }

  return parsed;
}

async function ensurePropertyImageTable(connection: mysql.Connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`PropertyImage\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`propertyId\` INT NOT NULL,
      \`url\` TEXT NOT NULL,
      \`room\` ENUM('LIVING','KITCHEN','BEDROOM','BATHROOM','BALCONY','EXTERIOR') NOT NULL,
      \`caption\` VARCHAR(255) NULL,
      \`sortOrder\` INT NOT NULL DEFAULT 0,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_property_image_property_id\` (\`propertyId\`),
      CONSTRAINT \`fk_property_image_property_id\`
        FOREIGN KEY (\`propertyId\`) REFERENCES \`Property\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

function pickUniqueUrl(room: Room, roomImages: RoomLibrary, used: Set<string>): string {
  const pool = roomImages[room];
  const maxAttempts = pool.length * 2;

  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = pool[randInt(0, pool.length - 1)];
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }

  for (const candidate of pool) {
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }

  const fallback = `${pool[0]}&variant=${used.size + 1}`;
  used.add(fallback);
  return fallback;
}

async function main() {
  const roomImages = await loadRoomImages();

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    await ensurePropertyImageTable(connection);

    const [rows] = await connection.query("SELECT id FROM `Property`");
    const properties = rows as PropertyRow[];

    if (!properties.length) {
      console.log("No properties found in Property table.");
      return;
    }

    console.log(`Found ${properties.length} properties. Regenerating room images...`);

    await connection.beginTransaction();
    try {
      await connection.query("DELETE FROM `PropertyImage`");

      let totalImages = 0;

      for (let pIndex = 0; pIndex < properties.length; pIndex += 1) {
        const propertyId = properties[pIndex].id;

        const bedrooms = Math.max(1, randInt(1, 4));
        const bathrooms = randInt(1, 3);

        const usedUrls = new Set<string>();
        const items: Array<{ url: string; room: Room; caption: string; sortOrder: number }> = [];

        const pushImage = (room: Room, caption: string) => {
          items.push({
            url: pickUniqueUrl(room, roomImages, usedUrls),
            room,
            caption,
            sortOrder: items.length + 1,
          });
        };

        pushImage("LIVING", ROOM_LABELS_AR.LIVING);
        pushImage("LIVING", `${ROOM_LABELS_AR.LIVING} 2`);

        pushImage("KITCHEN", ROOM_LABELS_AR.KITCHEN);

        for (let i = 1; i <= bathrooms; i += 1) {
          pushImage("BATHROOM", bathrooms > 1 ? `${ROOM_LABELS_AR.BATHROOM} ${i}` : ROOM_LABELS_AR.BATHROOM);
        }

        for (let i = 1; i <= bedrooms; i += 1) {
          pushImage("BEDROOM", `${ROOM_LABELS_AR.BEDROOM} ${i}`);
        }

        if (chance(0.4)) {
          pushImage("EXTERIOR", ROOM_LABELS_AR.EXTERIOR);
        }

        if (chance(0.3)) {
          pushImage("BALCONY", ROOM_LABELS_AR.BALCONY);
        }

        const imageValues: Array<string | number> = [];
        const placeholders = items
          .map((img) => {
            imageValues.push(propertyId, img.url, img.room, img.caption, img.sortOrder);
            return "(?, ?, ?, ?, ?, NOW(), NOW())";
          })
          .join(", ");

        await connection.execute(
          `INSERT INTO \`PropertyImage\` (propertyId, url, room, caption, sortOrder, createdAt, updatedAt) VALUES ${placeholders}`,
          imageValues,
        );

        totalImages += items.length;

        const thumb = items.find((x) => x.room === "LIVING")?.url || items[0].url;
        await connection.execute("UPDATE `Property` SET image = ?, updatedAt = NOW() WHERE id = ?", [thumb, propertyId]);

        if ((pIndex + 1) % 200 === 0) {
          console.log(`Processed ${pIndex + 1}/${properties.length} properties...`);
        }
      }

      await connection.commit();
      console.log(`Done. Updated ${properties.length} properties and inserted ${totalImages} PropertyImage rows.`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Image regeneration failed:", error);
  process.exit(1);
});
