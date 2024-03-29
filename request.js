// push notification

const body = {
  token:
    'eIPpmAS7NPdZGBb-9wGh0L:APA91bG4Tq2pPQgIa51T4IP1cR4BZc7dnAuzHBHfa902O2Kc5Waqkgzw5Od-lE6n6vaCDW3oUIiNInmyu9o7hLAo0GEWB6hWZGj6ONAHREXM4sbdBYrbJ1lRb2-3m7sgVzywOjvjC2VE',
  title: 'New Hotels added',
  body: 'Most requested hotel HSR briyani is added',
  link: 'http://delivery.goburn.in/',
  analyticsLabel: 'test',
  requireInteraction: true,
  notificationData: {
    vibrate: [200, 100, 200, 100, 200, 100, 200]
  },
  data: {
    myId: '0.822269521212355',
    analyticId: 'test-final'
  }
};
const baseUrl = window.location.href.split('/health')[0];
const token =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwOWY4ZTMzN2ZjNzg1NTE0ZTExMGM2ZDg0N2Y0M2M3NDM1M2U0YWYiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ0siLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWluZ2xlLW11bmNoIiwiYXVkIjoibWluZ2xlLW11bmNoIiwiYXV0aF90aW1lIjoxNzA5OTcyNTE2LCJ1c2VyX2lkIjoialRXU3l2SG1IdGJxbDcxS2ExYnBPb1hVa0gzMyIsInN1YiI6ImpUV1N5dkhtSHRicWw3MUthMWJwT29YVWtIMzMiLCJpYXQiOjE3MTAzMzA4NTEsImV4cCI6MTcxMDMzNDQ1MSwicGhvbmVfbnVtYmVyIjoiKzkxODc1NDc5MTU2OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxODc1NDc5MTU2OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.EhmVgA_98f_QxMhTOCsjgMj9kUJk-bWOvw_6l18agZwnl2rRKkKh2of6pj_UkhWgL0QokbYUM8EnsrnHXEyuffu864M6szNw9qQBXVroDWbWc6cveNVjesm703AVeMy7xOQlHkyEov-oXUJNBeW5580Eo5hmFzw_lNTgygZf-3ca8GfPFfPoazZ-Cs2vF8V0Q70FcpmA1L_pZ2ZoKvajLdLVHRqz8X_E3_bGRgs_bWhBDpPwLg_2jmITV7QSo0eQf0NYTuU9DV-IaCBbn5SCwrN7988-24cXo3R7wvx-PnpZ0wddI_GD0PRFzDFkbXLh7SAYRvjtCdqmR_2UprdVXQ';

fetch(`${baseUrl}/v1/notification`, {
  method: 'POST',
  body: JSON.stringify(body),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    authorization: `bearer ${token}`
  }
});

// adding shops
const body = {
  shopName: 'Fireside',
  shopAddress: 'omr',
  shopMapLocation: 'omr',
  shopImage:
    'https://www.shutterstock.com/image-photo/budapest-hungary-april-5-2019-260nw-1476971207.jpg',
  description: 'Open Area dining',
  isOpen: true,
  deliveryFee: 25,
  commission: 10,
  tag: 'Newly added',
  orderRank: 1
};
fetch('http://localhost:5001/mingle-munch/asia-south1/order/v1/shop', {
  headers: {
    'content-type': 'application/json',
    authorization:
      'b eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJwaG9uZV9udW1iZXIiOiIrOTE4NzU0NzkxNTY5IiwiYXV0aF90aW1lIjoxNzExMDg5MzA1LCJ1c2VyX2lkIjoiWXFXNE5OZ2VqcE80N0JDTmQ5aHlwVmJTbGVsViIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxODc1NDc5MTU2OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn0sImlhdCI6MTcxMTA4OTMwNSwiZXhwIjoxNzExMDkyOTA1LCJhdWQiOiJtaW5nbGUtbXVuY2giLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWluZ2xlLW11bmNoIiwic3ViIjoiWXFXNE5OZ2VqcE80N0JDTmQ5aHlwVmJTbGVsViJ9.'
  },
  referrer: 'http://localhost:5173/',
  referrerPolicy: 'strict-origin-when-cross-origin',
  body: JSON.stringify(body),
  method: 'POST',
  mode: 'cors',
  credentials: 'omit'
});
