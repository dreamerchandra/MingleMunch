/** @param { import('fireway').MigrateOptions } */
// eslint-disable-next-line no-undef
module.exports.migrate = async ({ firestore }) => {
  console.log('migration v0.0.2')
  await firestore.collection('food').stream().forEach(async (doc) => {
    await firestore.collection('food').doc(doc.id).update({
      updatedAt: new Date(),
      createdAt: new Date(),
      updateBy: 'jTWSyvHmHtbql71Ka1bpOoXUkH33'
    });
  });
};