// push notification

const body = {
  token:
    'f2Am5T9zaItXy8Mzq_UNiW:APA91bGNMXZr1C0RT_bH6P6tIuWLZDi0jSaNUfyigRjZj-Fr-iPUDJ9rX1HTAadx6Rh3Q3hYvvnHjoCeGNQOK1LXPBeF1LvSXoRSm2RRGg45jHUYdgjDnavT9JvpZVAMHC3G83e25YV7',
  title: 'New Hotels added',
  body: 'Most requested hotel HSR briyani is added',
  link: 'http://delivery.goburn.in/',
  analyticsLabel: 'test',
  requireInteraction: true,
  notificationData: {
    vibrate: [200, 100, 200, 100, 200, 100, 200]
  },
  data: {
    myId: '0.029660552285296404',
    analyticId: 'test-final'
  }
};
const baseUrl = window.location.href.split('/health')[0];
const token = `eyJhbGciOiJSUzI1NiIsImtpZCI6IjY5NjI5NzU5NmJiNWQ4N2NjOTc2Y2E2YmY0Mzc3NGE3YWE5OTMxMjkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ0siLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWluZ2xlLW11bmNoIiwiYXVkIjoibWluZ2xlLW11bmNoIiwiYXV0aF90aW1lIjoxNzA2ODA5MDIwLCJ1c2VyX2lkIjoialRXU3l2SG1IdGJxbDcxS2ExYnBPb1hVa0gzMyIsInN1YiI6ImpUV1N5dkhtSHRicWw3MUthMWJwT29YVWtIMzMiLCJpYXQiOjE3MDY4MjMwNjYsImV4cCI6MTcwNjgyNjY2NiwicGhvbmVfbnVtYmVyIjoiKzkxODc1NDc5MTU2OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxODc1NDc5MTU2OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.beOHIVUMuc4YbJHI22V5aKIi-f5psS_PG5K4Ncfod6OPWGJ3zIr7_Vv3xqhaH49OBhb1kFbdCaIre3tLi4B_sOuNW4X2x5q5cvGxrFUTUIhdNRLNuofW8rA47zaNolnc8_UAzB2eOxQCEt7UdTRFvHbeymNXU47w7MVfSJUM3ILpquB30KTr8cNBCfkWEwDGmmNzAc9_2ZnymdhwnUXs7nRycojUujpDN-w0qtm6REL3vZsweE__xCPeuqit4hF5IhCOz3ra1b69gRhDa6MMO9eqZ_C2HD7lh97v79FVi4nrvpgc-U-c0-u4WaN7mV-agPbj6b_i6FuyBU5hDuEFKA`;

fetch(`${baseUrl}/v1/notification`, {
  method: 'POST',
  body: JSON.stringify(body),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    authorization: `bearer ${token}`
  }
});
