import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
config();

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error('DATABASE_URL is not defined in .env file');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    console.log("Database name:", db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
  } finally {
    await client.close();
  }
}

run().catch(console.error);