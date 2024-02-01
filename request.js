// push notification

const body = {
    token: 'd8j-YLxAJTnyEb7_2I8pIm:APA91bENPbn7MK6c6Cxq2BiXveZnvjREIVh_wJATTf_Cl3CKezWNeVZWYSUMqMZ6etY8PbVmc_ucbgInMgJwX9YW-Rv44uZdrjFkbBG8rADJ6C7pgZ9TsLKUK5xcUpU9BQcKiHqnI7Kb',
    title: "New Hotels added",
    body: "Most requested hotel HSR briyani is added",
    link: "https://delivery.goburn.in/",
    analyticsLabel: "test",
    requireInteraction: true,
}
const baseUrl = 'https://asia-south1-mingle-munch.cloudfunctions.net/order'
const token = `eyJhbGciOiJSUzI1NiIsImtpZCI6IjViNjAyZTBjYTFmNDdhOGViZmQxMTYwNGQ5Y2JmMDZmNGQ0NWY4MmIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ0siLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWluZ2xlLW11bmNoIiwiYXVkIjoibWluZ2xlLW11bmNoIiwiYXV0aF90aW1lIjoxNzA2MzI5MTExLCJ1c2VyX2lkIjoialRXU3l2SG1IdGJxbDcxS2ExYnBPb1hVa0gzMyIsInN1YiI6ImpUV1N5dkhtSHRicWw3MUthMWJwT29YVWtIMzMiLCJpYXQiOjE3MDY0MTk3MTMsImV4cCI6MTcwNjQyMzMxMywicGhvbmVfbnVtYmVyIjoiKzkxODc1NDc5MTU2OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxODc1NDc5MTU2OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.OyQYKplEQ3hW8Xekuxfx_AltNlJJFWg-ih8XEV89UNKEzZZTNNSLOeiGfBfaGFsXWD89hbaKJSMQlqg_A_sCP3P-mfyRMyX41mfJ1bJCtt7MOxM-RVTLLb3QasiWWL1KvcK4EDBHvnumhPGOlJe0Y0kt4cKJhLB2urNBjq9RqAdqU9yIMDcGURhVlIMNNpRiFO2nKuLFnSpKzaGEvJtCtVKSRv_7NI4ggLa37cD5rtoDusMHVTpHiov1sdd3EfdsKIRQt1ZMc8Zx2ilt8OQEs89w3Vl9m4spnxmQtU8hIkZWY3paF1IhV6sI36FkC29YrKOwr_P9FD4S--yRk5ChnA`
fetch(`${baseUrl}/v1/notification`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
          'authorization': `bearer ${token}`
    },
})