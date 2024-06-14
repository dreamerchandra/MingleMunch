const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const fs = require('fs');

const app = initializeApp({
  // credential: './mingle-munch.json',
  credential: applicationDefault()
});
const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);
const storage = getStorage(app);

 const getNPS = async () => {
    const nps = await firebaseDb.collection('nps').get();
    const data = nps.docs.map((doc) => doc.data());
    const npsScore = []
    data.forEach((d) => {
        // console.log(d.rating[0].rating)
        npsScore.push(d.rating[0].rating)
    })
    const above9 = npsScore.filter((score) => score >= 9).length;
    const below7 = npsScore.filter((score) => score < 7).length;
    const or78 = npsScore.filter((score) => score >= 7 && score <= 8).length;
    const total = npsScore.length;
    const promoters = (above9 / total) * 100;
    const detractors = (below7 / total) * 100;
    const passives = (or78 / total) * 100;
    console.log({promoters, detractors, passives})
    const netNps = promoters - detractors;

    return netNps;
}

getNPS().then((data) => {
console.log(data)
})