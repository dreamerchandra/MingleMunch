import { useQuery } from '@tanstack/react-query';
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs
} from 'firebase/firestore';
import { firebaseDb } from '../../firebase/firebase/db';
import { useCart } from '../Shoping/cart-activity';

interface LocationData {
  name: string;
  deliveryPrice: Record<string, number>;
  id: string;
}

const locationConverter = {
  toFirestore(product: LocationData): DocumentData {
    return { ...product };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): LocationData {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id } as LocationData;
  }
};

const fetchLocationData = async () => {
  const q = collection(firebaseDb, 'location').withConverter(locationConverter);
  const querySnap = await getDocs(q);
  const data = querySnap.docs.map((doc) => doc.data());
  return data;
};

export const useLocationQuery = () => {
  return useQuery({
    queryKey: ['location-query'],
    queryFn: () => {
      return fetchLocationData();
    },
    staleTime: 1000 * 60 * 60
  });
};

export const useUserLocationPricingByShopId = (shopId?: string) => {
  const { data: locationData, isLoading } = useLocationQuery();
  const {
    cartDetails: { locationId }
  } = useCart();
  const location = locationData?.find((location) => location.id === locationId);
  const deliveryPrice = location?.deliveryPrice[shopId ?? ''];
  return { deliveryPrice, isLoading: !shopId ? true : isLoading };
};

export const useUserLocationPricing = () => {
  const { data: locationData, isLoading } = useLocationQuery();
  const {
    cartDetails: { locationId }
  } = useCart();
  const location = locationData?.find((location) => location.id === locationId);
  return { deliveryPrice: location?.deliveryPrice, isLoading };
};

export const useLocationDetails = () => {
  const { data: locationData, isLoading } = useLocationQuery();
  const {
    cartDetails: { locationId }
  } = useCart();
  const location = locationData?.find((location) => location.id === locationId);
  return { location, isLoading };
};
