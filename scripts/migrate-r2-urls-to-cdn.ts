// Script para actualizar URLs de R2 a Bunny CDN en MongoDB local
// Ejecutar con: npx tsx scripts/migrate-r2-urls-to-cdn.ts

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tourtovalencia";

// Patrones de URLs a reemplazar (múltiples buckets de R2)
const R2_PATTERNS = [
  /\.r2\.dev\/tourtovalencia\/public\//g,
  /\.r2\.dev\/menustudio-images-test\/tourtovalencia\/public\//g,
];
const R2_BASE_URLS = [
  "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public",
  "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/menustudio-images-test/tourtovalencia/public",
];
const CDN_BASE_URL = "https://cdn.tourtovalencia.com/public";

// Función para convertir URL de R2 a CDN
function r2ToCdn(url: string): string {
  if (!url) return url;

  if (url.includes(".r2.dev")) {
    // Extraer el nombre del archivo
    const filename = url.split("/").pop();
    if (filename) {
      return `${CDN_BASE_URL}/${filename}`;
    }
  }

  return url;
}

async function migrateUrls() {
  console.log("🔄 Iniciando migración de URLs de R2 a Bunny CDN...\n");

  const client = new MongoClient(MONGODB_URI);
  let db: Db;

  try {
    await client.connect();
    db = client.db();
    console.log("✅ Conectado a MongoDB local\n");

    // Obtener todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log(`📦 Encontradas ${collections.length} colecciones\n`);

    let totalUpdates = 0;
    let totalDocumentsChecked = 0;

    for (const collection of collections) {
      const collectionName = collection.name;
      const coll = db.collection(collectionName);

      // Buscar documentos que contengan URLs de R2
      const documents = await coll.find({}).toArray();
      let collectionUpdates = 0;

      for (const doc of documents) {
        totalDocumentsChecked++;
        let docUpdated = false;
        const docObj = doc as any;

        // Recorrer todas las propiedades del documento
        for (const [key, value] of Object.entries(docObj)) {
          if (key === "_id") continue;

          // Manejar strings
          if (typeof value === "string" && value.includes(".r2.dev")) {
            const newValue = r2ToCdn(value);
            if (newValue !== value) {
              await coll.updateOne(
                { _id: doc._id },
                { $set: { [key]: newValue } }
              );
              console.log(`  📝 ${collectionName}: Actualizado ${key}`);
              docUpdated = true;
              collectionUpdates++;
            }
          }

          // Manejar arrays de strings
          if (Array.isArray(value)) {
            let arrayUpdated = false;
            const newArray = value.map((item) => {
              if (typeof item === "string" && item.includes(".r2.dev")) {
                const newItem = r2ToCdn(item);
                if (newItem !== item) {
                  arrayUpdated = true;
                  return newItem;
                }
              }
              return item;
            });

            if (arrayUpdated) {
              await coll.updateOne(
                { _id: doc._id },
                { $set: { [key]: newArray } }
              );
              console.log(`  📝 ${collectionName}: Actualizado array ${key}`);
              docUpdated = true;
              collectionUpdates++;
            }
          }

          // Manejar objetos con propiedad source (como images[])
          if (value && typeof value === "object" && !Array.isArray(value)) {
            if ("source" in value && typeof value.source === "string" && value.source.includes(".r2.dev")) {
              const newSource = r2ToCdn(value.source);
              if (newSource !== value.source) {
                await coll.updateOne(
                  { _id: doc._id },
                  { $set: { [`${key}.source`]: newSource } }
                );
                console.log(`  📝 ${collectionName}: Actualizado ${key}.source`);
                docUpdated = true;
                collectionUpdates++;
              }
            }

            // Manejar objetos con propiedad preview
            if ("preview" in value && typeof value.preview === "string" && value.preview.includes(".r2.dev")) {
              const newPreview = r2ToCdn(value.preview);
              if (newPreview !== value.preview) {
                await coll.updateOne(
                  { _id: doc._id },
                  { $set: { [`${key}.preview`]: newPreview } }
                );
                console.log(`  📝 ${collectionName}: Actualizado ${key}.preview`);
                docUpdated = true;
                collectionUpdates++;
              }
            }

            // Manejar objetos con propiedad image
            if ("image" in value && typeof value.image === "string" && value.image.includes(".r2.dev")) {
              const newImage = r2ToCdn(value.image);
              if (newImage !== value.image) {
                await coll.updateOne(
                  { _id: doc._id },
                  { $set: { [`${key}.image`]: newImage } }
                );
                console.log(`  📝 ${collectionName}: Actualizado ${key}.image`);
                docUpdated = true;
                collectionUpdates++;
              }
            }
          }

          // Manejar arrays de objetos con source (como images: [{ source: "...", alt: "..." }])
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const item = value[i];
              if (item && typeof item === "object" && "source" in item) {
                const source = item.source as string;
                if (source && source.includes(".r2.dev")) {
                  const newSource = r2ToCdn(source);
                  if (newSource !== source) {
                    await coll.updateOne(
                      { _id: doc._id },
                      { $set: { [`${key}.${i}.source`]: newSource } }
                    );
                    console.log(`  📝 ${collectionName}: Actualizado ${key}[${i}].source`);
                    docUpdated = true;
                    collectionUpdates++;
                  }
                }
              }
            }
          }
        }
      }

      if (collectionUpdates > 0) {
        console.log(`  ✅ ${collectionName}: ${collectionUpdates} actualizaciones\n`);
        totalUpdates += collectionUpdates;
      }
    }

    console.log("\n📊 Resumen de migración:");
    console.log(`   - Documentos revisados: ${totalDocumentsChecked}`);
    console.log(`   - Total actualizaciones: ${totalUpdates}`);
    console.log("\n✅ Migración completada!");

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n🔒 Conexión a MongoDB cerrada");
  }
}

// Ejecutar si es el módulo principal
migrateUrls().catch(console.error);
