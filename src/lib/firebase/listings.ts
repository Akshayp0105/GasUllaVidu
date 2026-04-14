import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export type ListingRecord = {
  brand?: string
  weight?: string
  condition?: string
  level?: number
  levelMethod?: string
  price?: number
  delivery?: string
  distance?: string | number
  locationName?: string
  latitude?: number
  longitude?: number
  userId?: string
  userName?: string
  createdAt?: unknown
}

export type ListingView = {
  id: string
  brand: string
  weight: string
  condition: string
  level: number
  levelMethod: string
  price: number
  delivery: string
  distance: string
  locationName: string
  latitude: number | null
  longitude: number | null
}

type CreateListingInput = {
  brand: string
  weight: string
  condition: string
  level: number
  locationName: string
  latitude: number
  longitude: number
  userId: string
  userName: string
}

function getDefaultPrice(brand: string) {
  if (brand.includes('Indane')) return 1050
  if (brand.includes('HP')) return 1000
  return 1020
}

function getDefaultLevelMethod(condition: string, level: number) {
  if (condition.includes('Factory Sealed') || level === 100) {
    return 'Weight Test'
  }

  return 'Estimation'
}

function getDefaultDistance(distance?: string | number) {
  if (typeof distance === 'number' && Number.isFinite(distance)) {
    return distance.toFixed(1)
  }

  if (typeof distance === 'string' && distance.trim()) {
    return distance
  }

  return '0.0'
}

function getValidCoordinate(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function calculateDistanceKm(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371
  const dLat = toRadians(destination.latitude - origin.latitude)
  const dLon = toRadians(destination.longitude - origin.longitude)
  const startLat = toRadians(origin.latitude)
  const endLat = toRadians(destination.latitude)

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))

  return earthRadiusKm * angularDistance
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function mapListingDoc(
  doc: QueryDocumentSnapshot<ListingRecord>,
): ListingView {
  const data = doc.data()
  const level = typeof data.level === 'number' ? Math.max(0, Math.min(100, data.level)) : 0
  const condition = data.condition?.trim() || 'Used'
  const latitude = getValidCoordinate(data.latitude)
  const longitude = getValidCoordinate(data.longitude)

  return {
    id: doc.id,
    brand: data.brand?.trim() || 'Unknown Brand',
    weight: data.weight?.trim() || '14.2kg',
    condition,
    level,
    levelMethod: data.levelMethod?.trim() || getDefaultLevelMethod(condition, level),
    price: typeof data.price === 'number' ? data.price : getDefaultPrice(data.brand || ''),
    delivery: data.delivery?.trim() || 'Pickup Only',
    distance: getDefaultDistance(data.distance),
    locationName: data.locationName?.trim() || 'Location unavailable',
    latitude,
    longitude,
  }
}

export function subscribeToListings(
  db: Firestore,
  onData: (listings: ListingView[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'))

  return onSnapshot(
    listingsQuery,
    (snapshot) => {
      onData(snapshot.docs.map((doc) => mapListingDoc(doc as QueryDocumentSnapshot<ListingRecord>)))
    },
    (error) => {
      onError?.(error)
    },
  )
}

export async function createListing(db: Firestore, input: CreateListingInput) {
  const level = Math.max(0, Math.min(100, input.level))

  return addDoc(collection(db, 'listings'), {
    brand: input.brand,
    weight: input.weight,
    condition: input.condition,
    level,
    levelMethod: getDefaultLevelMethod(input.condition, level),
    price: getDefaultPrice(input.brand),
    delivery: 'Pickup Only',
    distance: '0.0',
    locationName: input.locationName.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    userId: input.userId,
    userName: input.userName,
    createdAt: serverTimestamp(),
  })
}
