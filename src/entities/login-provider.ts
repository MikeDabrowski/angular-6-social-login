import { SocialUser } from './user';
import { Observable } from 'rxjs';

export interface LoginProviderOptions {
  locale?: string;
  fields?: string[];
  scope?: string[];
}

export interface LoginProvider {
  options?: LoginProviderOptions;
  initialize(): Observable<SocialUser>;
  signIn(): Observable<SocialUser>;
  signOut(): Observable<any>;
}

