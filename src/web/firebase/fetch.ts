import { isLocalhost } from '../utils';
import { firebaseAuth } from './firebase/auth';

const getJsonError = (res: string) => {
  try {
    return JSON.parse(res);
  } catch (e) {
    return {};
  }
};

const handleError = async (res: Response) => {
  if (res.ok) {
    return res;
  }
  throw Error(res.statusText, { cause: getJsonError(await res.text()) });
};

const constructSearch = (params: any) => {
  const search = new URLSearchParams();
  const dropNA = ([key, val]: any) => key != null && val != null;
  const updateParam = ([key, val]: any) => {
    search.set(key, val);
  };
  Object.entries(params).filter(dropNA).forEach(updateParam);
  console.log(search);
  return search;
};

const baseUrl = isLocalhost()
  ? 'http://localhost:5001/mingle-munch/asia-south1/order'
  : 'https://asia-south1-mingle-munch.cloudfunctions.net/order';

const reportUrl = isLocalhost()
  ? 'http://localhost:5001/mingle-munch/asia-south1/triggerReport'
  : 'https://asia-south1-mingle-munch.cloudfunctions.net/triggerReport';

export const get = async (
  urlString: string,
  params?: any,
  signal?: AbortController['signal']
) => {
  const url = new URL(`${baseUrl}${urlString}`);
  url.search = params ? constructSearch(params).toString() : '';
  console.log(url.pathname, url.search);
  try {
    let token = await firebaseAuth.currentUser?.getIdToken();
    const result = await firebaseAuth.currentUser?.getIdTokenResult();
    if (!result) {
      throw new Error('No token found');
    }
    if (new Date(result.expirationTime).valueOf() < Date.now()) {
      console.log('token expired, refreshing');
      token = await firebaseAuth.currentUser?.getIdToken(true);
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(params),
      signal
    });
    handleError(res);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
export const post = async (
  urlString: string,
  params: any,
  shouldLogin?: boolean,
  signal?: AbortController['signal']
) => {
  const url = new URL(`${baseUrl}${urlString}`);
  let token = await firebaseAuth.currentUser?.getIdToken();
  if (shouldLogin) {
    const result = await firebaseAuth.currentUser?.getIdTokenResult();
    if (!result) {
      throw new Error('No token found');
    }
    if (new Date(result.expirationTime).valueOf() < Date.now()) {
      console.log('token expired, refreshing');
      token = await firebaseAuth.currentUser?.getIdToken(true);
    }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(params),
      signal
    });
    await handleError(res);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const generateReport = async () => {
  const url = new URL(reportUrl);
  const token = await firebaseAuth.currentUser?.getIdToken();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    });
    await handleError(res);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
