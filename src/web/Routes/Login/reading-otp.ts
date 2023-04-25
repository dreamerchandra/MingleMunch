export function autoReadSMS(cb: (code: string) => void) {
  // used AbortController with setTimeout so that WebOTP API (Autoread sms) will get disabled after 1min
  const ac = new AbortController();
  setTimeout(() => {
    ac.abort();
  }, 1 * 60 * 1000);
  async function main() {
    if ('OTPCredential' in window) {
      try {
        if (navigator.credentials) {
          try {
            await navigator.credentials
              .get({
                otp: { transport: ['sms'] },
                signal: ac.signal
              } as any)
              .then((content: any) => {
                if (content && content.code) {
                  cb(content.code);
                }
              })
              .catch((e) => console.log(e));
          } catch (e) {
            return;
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  main();
}
