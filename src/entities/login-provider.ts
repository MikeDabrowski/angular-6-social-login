import { SocialUser } from './user';
import { Observable } from 'rxjs';

export interface LoginProvider {
  initialize(): Observable<SocialUser>;
  signIn(): Observable<SocialUser>;
  signOut(): Observable<any>;
}

