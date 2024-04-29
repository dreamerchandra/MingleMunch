import { DocumentData } from 'firebase-admin/firestore';
import { firebaseDb } from '../firebase.js';

export interface LocationData {
  name: string;
  deliveryPrice: Record<string, number>;
  id: string;
}

const locationConverter = {
  toFirestore(product: LocationData): DocumentData {
    return { ...product };
  },

  fromFirestore(
    snap: FirebaseFirestore.QueryDocumentSnapshot<LocationData>
  ): LocationData {
    const data = snap.data();
    return { ...data, id: snap.id } as LocationData;
  }
};

export const getLocationById = async (locationId: string) => {
  const location = await firebaseDb
    .doc(`location/${locationId}`)
    .withConverter(locationConverter)
    .get();
  return location.data();
};
