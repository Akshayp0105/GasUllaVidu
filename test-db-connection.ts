import { MongoClient } from 'mongodb'

async function testConnection() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();