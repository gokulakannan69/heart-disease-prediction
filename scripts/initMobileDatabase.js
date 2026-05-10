import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI?.trim() ||
  process.env.MONGO_URI?.trim() ||
  process.env.MONGODB_URL?.trim();
const mobileDbName = process.env.MONGODB_MOBILE_DB_NAME || 'heart_guardian_mobile';

if (!mongoUri) {
  throw new Error(
    'MongoDB URI is required. Set MONGODB_URI (or MONGO_URI / MONGODB_URL) in your .env file.'
  );
}

if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
  throw new Error(
    `Invalid MongoDB URI "${mongoUri}". It must start with "mongodb://" or "mongodb+srv://".`
  );
}

const COLLECTIONS = {
  users: 'hg_mobile_users',
  reports: 'hg_mobile_reports',
  blockchain: 'hg_mobile_blockchain',
  syncEvents: 'hg_mobile_sync_events'
};

async function run() {
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000)
  });

  try {
    await client.connect();
    const db = client.db(mobileDbName);

    const users = db.collection(COLLECTIONS.users);
    const reports = db.collection(COLLECTIONS.reports);
    const blockchain = db.collection(COLLECTIONS.blockchain);
    const syncEvents = db.collection(COLLECTIONS.syncEvents);

    await Promise.all([
      users.createIndex({ emailLower: 1 }, { unique: true }),
      reports.createIndex({ id: 1 }, { unique: true }),
      reports.createIndex({ timestamp: -1 }),
      blockchain.createIndex({ hash: 1 }, { unique: true }),
      blockchain.createIndex({ index: 1 }),
      syncEvents.createIndex({ eventId: 1 }, { unique: true }),
      syncEvents.createIndex({ createdAt: -1 })
    ]);

    console.log(`Mobile database initialized: ${mobileDbName}`);
    console.log('Collections ready:');
    Object.values(COLLECTIONS).forEach((name) => console.log(`- ${name}`));
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error('Failed to initialize mobile database:', error);
  process.exit(1);
});
