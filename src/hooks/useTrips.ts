import type { AdaptiveTrip, TripConstraints } from '../types/trip'

export async function saveTrip(trip: AdaptiveTrip, constraints: TripConstraints): Promise<string> {
  const [{ db, auth }, { collection, addDoc, serverTimestamp }, { signInAnonymously }] = await Promise.all([
    import('../lib/firebase'),
    import('firebase/firestore'),
    import('firebase/auth'),
  ])

  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }

  const docRef = await addDoc(collection(db, 'trips'), {
    userId: auth.currentUser!.uid,
    destination: trip.destination,
    days: trip.days,
    summary: trip.summary,
    constraints,
    createdAt: serverTimestamp(),
  })
  const tripId = docRef.id

  // Upload trip JSON to Firebase Storage for sharing/download (non-critical)
  uploadTripToStorage(tripId, trip, constraints, auth.currentUser!.uid).catch(() => {})

  return tripId
}

async function uploadTripToStorage(
  tripId: string,
  trip: AdaptiveTrip,
  constraints: TripConstraints,
  userId: string,
): Promise<void> {
  const [{ app }, { getStorage, ref, uploadString }] = await Promise.all([
    import('../lib/firebase'),
    import('firebase/storage'),
  ])

  const storage = getStorage(app)
  const storageRef = ref(storage, `trips/${userId}/${tripId}.json`)
  const payload = JSON.stringify(
    { tripId, trip, constraints, exportedAt: new Date().toISOString() },
    null,
    2,
  )
  await uploadString(storageRef, payload, 'raw', { contentType: 'application/json' })
}
