import { logEvent, setUserId } from 'firebase/analytics';
import { User } from 'firebase/auth';
import LogRocket from 'logrocket';
import { analytics } from '../web/firebase/firebase/firebsae-app';

export class Analytics {
  static userId?: string;
  static internalUser: boolean;

  static init(user: User, isInternal: boolean) {
    this.userId = user.uid;
    this.internalUser = isInternal;
    if (isInternal) {
      localStorage.setItem('internal', 'true');
      return;
    }
    analytics && setUserId(analytics, user.uid);
    LogRocket.identify(user.uid, {
      name: user.displayName!,
      phone: user.phoneNumber!,
      uid: user.uid!
    });
  }
  static pushEvent(eventName: string, eventParams: any = {}) {
    if (typeof this.internalUser === 'boolean' && this.internalUser) {
      return;
    }
    if(analytics === undefined) return;

    LogRocket.track(eventName, { ...eventParams, userId: this.userId });
    logEvent(analytics, eventName, { ...eventParams, userId: this.userId });
  }
}

export const logError = (error: Error) => {
  LogRocket.captureException(error);
  analytics && logEvent(analytics, 'error', { error });
};
