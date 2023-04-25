import { isLocalhost } from '../utils';
import { firebaseAuth } from './firebase';

const handleError = (res: Response) => {
  if (res.ok) {
    return res;
  }
  throw Error(res.statusText);
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
  ? 'http://localhost:5001/tieheart-f1808/us-central1/app'
  : 'https://us-central1-tieheart-f1808.cloudfunctions.net/app';

export const get = async (
  urlString: string,
  params: any,
  signal?: AbortController['signal']
) => {
  const url = new URL(`${baseUrl}${urlString}}`);
  url.search = constructSearch(params).toString();
  try {
    const res = await fetch(url, { signal });
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
  signal?: AbortController['signal']
) => {
  const url = new URL(`${baseUrl}${urlString}`);
  const token = await firebaseAuth.currentUser?.getIdToken();
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
    handleError(res);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
