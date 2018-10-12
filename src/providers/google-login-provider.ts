import { BaseLoginProvider } from '../entities/base-login-provider';
import { GoogleUser, LoginProviderClass } from '../entities/user';
import { Observable } from 'rxjs';

declare let gapi: any;

export class GoogleLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'google';
  public loginProviderObj: LoginProviderClass = new LoginProviderClass();
  private auth2: any;

  constructor(private clientId: string) {
    super();
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'google';
    this.loginProviderObj.url = 'https://apis.google.com/js/platform.js';
  }

  initialize(): Observable<GoogleUser> {
    return new Observable.create((observer) => {
      this.loadScript(this.loginProviderObj, () => {
          gapi.load('auth2', () => {
            this.auth2 = gapi.auth2.init({
              client_id: this.clientId,
              scope: 'email'
            });

            this.auth2.then(() => {
              if (this.auth2.isSignedIn.get()) {
                observer.next(this.drawUser());
              }
            });
          });
      });
    });
  }

  drawUser(): GoogleUser {
    let user: GoogleUser = new GoogleUser();
    let profile = this.auth2.currentUser.get().getBasicProfile();
    let authResponseObj = this.auth2.currentUser.get().getAuthResponse(true);
    user.id = profile.getId();
    user.name = profile.getName();
    user.email = profile.getEmail();
    user.image = profile.getImageUrl();
    user.firstName = profile.getGivenName();
    user.lastName = profile.getFamilyName();
    user.token = authResponseObj.access_token;
    user.idToken = authResponseObj.id_token;
    return user;
  }

  signIn(): Observable<GoogleUser> {
    return new Observable.create((observer) => {
      this.auth2.signIn().then(() => {
        observer.mext(this.drawUser());
      });
    });
  }

  signOut(): Observable<any> {
    return new Observable.create((observer) => {
      this.auth2.signOut().then((err: any) => {
        if (err) {
          observer.error(err);
        } else {
          observer.next();
        }
      });
    });
  }

}
