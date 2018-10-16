import { LoginProvider, LoginProviderOptions } from './login-provider';
import { SocialUser, LoginProviderClass } from './user';
import { Observable } from 'rxjs';

export abstract class BaseLoginProvider implements LoginProvider {
  abstract options: LoginProviderOptions;

  constructor() {}

  abstract initialize(): Observable<SocialUser>;
  abstract signIn(): Observable<SocialUser>;
  abstract signOut(): Observable<any>;

  loadScript(obj: LoginProviderClass, onload: any): void {
    if (document.getElementById(obj.name)) { return; }
    const signInJS = document.createElement('script');
    signInJS.async = true;
    signInJS.src = obj.url;
    signInJS.onload = onload;
    if (obj.name === 'linkedin') {
      signInJS.async = false;
      signInJS.text = ('api_key: ' + obj.id).replace('\'', '');
    }
    document.head.appendChild(signInJS);
  }

  parseFields(options: LoginProviderOptions) {
    if (options && options.fields) {
      return options.fields.join(',');
    }
  }

  parseScope(options: LoginProviderOptions) {
    if (options && options.scope) {
      return options.scope.join(',');
    }
  }
}
