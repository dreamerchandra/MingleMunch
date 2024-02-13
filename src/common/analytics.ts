import { logEvent, setUserId } from 'firebase/analytics';
import { User } from 'firebase/auth';
import LogRocket from 'logrocket';
import { analytics } from '../web/firebase/firebase/firebsae-app';
import { isInternal } from './types/constant';


export class Analytics {
  static userId?: string;
  static internalUser: boolean;

  static init(userId: string) {
    this.userId = userId;
    this.internalUser = false;
    const analyticsId = localStorage.getItem('analyticsId');
    if(isInternal) {
      this.internalUser = true;
      return;
    }
    if (analytics) {
      setUserId(analytics, analyticsId);
    }
    LogRocket.identify(analyticsId!);
  }

  static updateUser(user: User) {
    const analyticsId = localStorage.getItem('analyticsId');
    LogRocket.identify(analyticsId!, {
      name: user.displayName!,
      phone: user.phoneNumber!,
      uid: user.uid!
    });
  }
  static pushEvent(eventName: string, eventParams: any = {}) {
    if (typeof this.internalUser === 'boolean' && this.internalUser) {
      return;
    }
    if (analytics === undefined) return;

    LogRocket.track(eventName, { ...eventParams, userId: this.userId });
    logEvent(analytics, eventName, { ...eventParams, userId: this.userId });
  }
}

export const logError = (error: Error) => {
  LogRocket.captureException(error);
  analytics && logEvent(analytics, 'error', { error });
};
