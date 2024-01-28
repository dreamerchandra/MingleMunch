
self.addEventListener('notificationclick', function (event) {
  event.stopImmediatePropagation();
  event.notification.close();
  var redirectUrl = null;
  var tag = event.notification.tag;
  console.log(event.notification.data.FCM_MSG.data)
  event.waitUntil(
    (async function () {
      var allClients = await clients.matchAll({
        includeUncontrolled: !0
      });
      if(allClients.length > 0){
        allClients[0].focus();
        allClients[0].navigate(redirectUrl);
      }else{
        clients.openWindow(event.notification.data.FCM_MSG.data.link);
      }
    })().then((result) => {
      if (tag) {
        //PostAction(tag, "click")
      }
    })
  );
});


importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '291354377634'
});

firebase.messaging();
