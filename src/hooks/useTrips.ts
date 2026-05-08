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
  return docRef.id
}
