import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginProvider, SocialUser } from './entities';

export interface AuthServiceConfigItem {
  id: string;
  provider: LoginProvider;
}

export class AuthServiceConfig {
  providers: Map<string, LoginProvider> = new Map<string, LoginProvider>();

  constructor(providers: AuthServiceConfigItem[]) {
    for (let i = 0; i < providers.length; i++) {
      const element = providers[i];
      this.providers.set(element.id, element.provider);
    }
  }
}

@Injectable()
export class AuthService {

  private static readonly LOGIN_PROVIDER_NOT_FOUND = 'Login provider not found';

  private providers: Map<string, LoginProvider>;

  private _user: SocialUser = null;
  private _authState: BehaviorSubject<SocialUser> = new BehaviorSubject(null);

  get authState(): Observable<SocialUser> {
    return this._authState.asObservable();
  }

  constructor(config: AuthServiceConfig) {
    this.providers = config.providers;
    this.providers.forEach((provider: LoginProvider, key: string) => {
      provider.initialize()
          .subscribe(
              (user: SocialUser) => {
                user.provider = key;
                this._user = user;
                this._authState.next(user);
              },
              (err) => {
                // this._authState.next(null);
              });
    });
  }

  signIn(providerId: string): Observable<SocialUser> {
    return Observable.create((observer) => {
      const providerObject = this.providers.get(providerId);
      if (providerObject) {
        providerObject.signIn().subscribe(
            (user: SocialUser) => {
              user.provider = providerId;
              observer.next(user);
              this._user = user;
              this._authState.next(user);
            });
      } else {
        observer.error(AuthService.LOGIN_PROVIDER_NOT_FOUND);
      }
    });
  }

  signOut(): Promise<any> {
    return Observable.create((observer) => {
      if (this._user && this._user.provider) {
        const providerId = this._user.provider;
        const providerObject = this.providers.get(providerId);
        providerObject.signOut().subscribe(
            () => {
              this._user = null;
              this._authState.next(null);
              observer.next();
            },
            (err) => {
              this._authState.next(null);
              observer.error(err);
            });
      } else {
        observer.error(AuthService.LOGIN_PROVIDER_NOT_FOUND);
      }
    });
  }

}
