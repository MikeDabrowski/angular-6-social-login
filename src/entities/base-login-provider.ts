import { LoginProvider } from './login-provider';
import { SocialUser, LoginProviderClass } from './user';
import { Observable } from 'rxjs';

export abstract class BaseLoginProvider implements LoginProvider {
  constructor() {}

  abstract initialize(): Observable<SocialUser>;
  abstract signIn(): Observable<SocialUser>;
  abstract signOut(): Observable<any>;

  loadScript(obj: LoginProviderClass, onload: any): void {
    if (document.getElementById(obj.name)) { return; }
    let signInJS = document.createElement('script');
    signInJS.async = true;
    signInJS.src = obj.url;
    signInJS.onload = onload;
    if (obj.name === 'linkedin') {
      signInJS.async = false;
      signInJS.text = ('api_key: ' + obj.id).replace('\'', '');
    }
    document.head.appendChild(signInJS);
  }
}
