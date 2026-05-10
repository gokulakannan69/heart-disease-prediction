import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri =
  process.env.MONGODB_URI?.trim() ||
  process.env.MONGO_URI?.trim() ||
  process.env.MONGODB_URL?.trim();
const databaseName = process.env.MONGODB_DB_NAME || 'heart_guardian';

if (!mongoUri) {
  throw new Error(
    'MongoDB URI is required. Set MONGODB_URI (or MONGO_URI / MONGODB_URL) in your environment.'
  );
}

if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
  throw new Error(
    `Invalid MongoDB URI "${mongoUri}". It must start with "mongodb://" or "mongodb+srv://".`
  );
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
  connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000)
});
let db;
const COLLECTIONS = {
  users: 'hg_project_users',
  reports: 'hg_project_reports',
  blockchain: 'hg_project_blockchain'
};

function collections() {
  return {
    reports: db.collection(COLLECTIONS.reports),
    blockchain: db.collection(COLLECTIONS.blockchain),
    users: db.collection(COLLECTIONS.users)
  };
}

async function migrateLegacyCollections() {
  const legacyNames = {
    users: 'users',
    reports: 'reports',
    blockchain: 'blockchain'
  };

  const currentNames = Object.values(COLLECTIONS);
  const legacyCollections = await db
    .listCollections({ name: { $in: Object.values(legacyNames) } }, { nameOnly: true })
    .toArray();

  for (const [key, legacyName] of Object.entries(legacyNames)) {
    if (currentNames.includes(legacyName)) {
      continue;
    }

    const legacyExists = legacyCollections.some((collection) => collection.name === legacyName);
    if (!legacyExists) {
      continue;
    }

    const targetName = COLLECTIONS[key];
    const source = db.collection(legacyName);
    const target = db.collection(targetName);
    const docs = await source.find({}).toArray();
    if (docs.length === 0) {
      continue;
    }

    const operations = docs.map((doc) => {
      const { _id, ...payload } = doc;
      const uniqueFilter =
        key === 'reports'
          ? { id: payload.id }
          : key === 'blockchain'
            ? { hash: payload.hash }
            : { emailLower: payload.emailLower };

      return {
        updateOne: {
          filter: uniqueFilter,
          update: { $set: payload },
          upsert: true
        }
      };
    });

    await target.bulkWrite(operations, { ordered: false });
  }
}

function toPublicUser(userDoc) {
  return {
    id: userDoc.id,
    name: userDoc.name,
    email: userDoc.email,
    licenseId: userDoc.licenseId,
    specialization: userDoc.specialization
  };
}

async function ensureDefaultUsers() {
  const { users } = collections();
  const defaults = [
    {
      id: '1',
      name: 'Dr. Sarah Jenkins',
      email: 'dr.jenkins@hospital.org',
      emailLower: 'dr.jenkins@hospital.org',
      specialization: 'Chief Cardiologist',
      licenseId: 'MD-8829-X',
      password: 'password'
    },
    {
      id: '2',
      name: 'Gokul',
      email: 'gokul@Org',
      emailLower: 'gokul@org',
      specialization: 'Senior Cardiologist',
      licenseId: 'MD-9999-Y',
      password: 'password123'
    }
  ];

  await Promise.all(
    defaults.map((user) =>
      users.updateOne({ emailLower: user.emailLower }, { $setOnInsert: user }, { upsert: true })
    )
  );
}

app.get('/api/health', async (_req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database unreachable', error: String(error) });
  }
});

app.get('/api/reports', async (_req, res) => {
  const { reports } = collections();
  const data = await reports.find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).toArray();
  res.json(data);
});

app.post('/api/reports', async (req, res) => {
  const report = req.body;
  if (!report?.id) {
    return res.status(400).json({ success: false, message: 'Report id is required' });
  }

  const { reports } = collections();
  await reports.updateOne({ id: report.id }, { $set: report }, { upsert: true });
  return res.json({ success: true });
});

app.get('/api/blockchain', async (_req, res) => {
  const { blockchain } = collections();
  const data = await blockchain.find({}, { projection: { _id: 0 } }).sort({ index: 1 }).toArray();
  res.json(data);
});

app.post('/api/blockchain', async (req, res) => {
  const block = req.body;
  if (!block?.hash) {
    return res.status(400).json({ success: false, message: 'Block hash is required' });
  }

  const { blockchain } = collections();
  await blockchain.updateOne({ hash: block.hash }, { $set: block }, { upsert: true });
  return res.json({ success: true });
});

app.get('/api/users', async (_req, res) => {
  const { users } = collections();
  const data = await users
    .find({}, { projection: { _id: 0, password: 0, emailLower: 0 } })
    .sort({ name: 1 })
    .toArray();
  res.json(data);
});

app.post('/api/users/register', async (req, res) => {
  const { name, email, password, licenseId, specialization } = req.body || {};
  if (!name || !email || !password || !licenseId || !specialization) {
    return res.status(400).json({ success: false, message: 'Missing required user fields' });
  }

  const emailLower = String(email).toLowerCase().trim();
  const { users } = collections();
  const existing = await users.findOne({ emailLower });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  const user = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    name: String(name),
    email: String(email).trim(),
    emailLower,
    specialization: String(specialization),
    licenseId: String(licenseId),
    password: String(password)
  };

  await users.insertOne(user);
  return res.status(201).json({ success: true, user: toPublicUser(user) });
});

app.post('/api/users/login', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const { users } = collections();
  const user = await users.findOne({ emailLower: email, password });
  if (!user) {
    return res.status(401).json({ success: false });
  }

  return res.json({ success: true, user: toPublicUser(user) });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  try {
    await client.connect();
    db = client.db(databaseName);
    await db.command({ ping: 1 });
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error(`URI: ${mongoUri}`);
    console.error(`Database: ${databaseName}`);
    console.error(
      'Check that MongoDB is running, your URI is correct, and network/firewall access is allowed.'
    );
    throw error;
  }

  await migrateLegacyCollections();

  const { reports, blockchain, users } = collections();
  await Promise.all([
    reports.createIndex({ id: 1 }, { unique: true }),
    reports.createIndex({ timestamp: -1 }),
    blockchain.createIndex({ hash: 1 }, { unique: true }),
    blockchain.createIndex({ index: 1 }),
    users.createIndex({ emailLower: 1 }, { unique: true })
  ]);

  await ensureDefaultUsers();

  app.listen(port, () => {
    console.log(`MongoDB API running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
