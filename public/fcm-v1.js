self.addEventListener('notificationclick', function (event) {
  event.stopImmediatePropagation();
  event.notification.close();
  var redirectUrl = null;
  var tag = event.notification.tag;
  const isLocalhost = location.origin.includes('localhost');
  const baseUrl = isLocalhost
    ? 'http://localhost:5001/mingle-munch/asia-south1/order'
    : 'https://asia-south1-mingle-munch.cloudfunctions.net/order';
  const { myId, analyticId } = event.notification.data.FCM_MSG.data;
  const body = {
    myId,
    analyticId,
    action: 'clicked'
  };
  fetch(`${baseUrl}/v1/fcm-analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(function () {
    console.log('ok');
  });
  event.waitUntil(
    (async function () {
      var allClients = await clients.matchAll({
        includeUncontrolled: !0
      });
      if (allClients.length > 0) {
        allClients[0].focus();
        allClients[0].navigate(redirectUrl);
      } else {
        clients.openWindow(event.notification.data.FCM_MSG.data.link);
      }
    })().then((result) => {
      if (tag) {
        //PostAction(tag, "click")
      }
    })
  );
});

self.addEventListener('notificationclose', function (event) {
  console.log('notification closed');
});

self.addEventListener('push', function (event) {
  console.log('push event', event);
  const isLocalhost = location.origin.includes('localhost');
  const baseUrl = isLocalhost
    ? 'http://localhost:5001/mingle-munch/asia-south1/order'
    : 'https://asia-south1-mingle-munch.cloudfunctions.net/order';
  const data = event.data.json();
  const { myId, analyticId } = data.data;
  const body = {
    myId,
    analyticId,
    action: 'received'
  };
  fetch(`${baseUrl}/v1/fcm-analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(function () {
    console.log('ok')
  });
});

importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyCajB1KkrNGpB9eiM8ph2FFOTX35T7wB60',
  authDomain: 'mingle-munch.firebaseapp.com',
  projectId: 'mingle-munch',
  storageBucket: 'mingle-munch.appspot.com',
  messagingSenderId: '291354377634',
  appId: '1:291354377634:web:5f1d53b7cda2b2fd50c6fb',
  measurementId: 'G-S2H7D2Z5LC'
};

firebase.initializeApp(firebaseConfig);

const fcm = firebase.messaging();
