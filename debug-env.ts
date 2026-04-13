import { config } from 'dotenv'
config()

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
if (process.env.DATABASE_URL) {
  console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 50))
}