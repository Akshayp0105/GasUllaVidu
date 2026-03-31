import { PrismaClient } from '@prisma/client/index.js'

const prismaClientSingleton = () => {
  // During Turbopack build, if the edge client is incorrectly loaded, returning a mock proxy prevents the constructor error.
  if (process.env.npm_lifecycle_event === 'build') {
    return {} as PrismaClient; // Mock client for build collection phase
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}


declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
