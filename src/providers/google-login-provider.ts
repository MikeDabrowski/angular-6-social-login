import { BaseLoginProvider } from '../entities/base-login-provider';
import { LoginProviderOptions } from '../entities/login-provider';
import { GoogleUser, LoginProviderClass } from '../entities/user';
import { Observable } from 'rxjs';

declare let gapi: any;

export class GoogleLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'google';
  public loginProviderObj: LoginProviderClass = new LoginProviderClass();
  private auth2: any;

  constructor(private clientId: string, public options: LoginProviderOptions = {}) {
    super();
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'google';
    this.loginProviderObj.url = 'https://apis.google.com/js/platform.js?hl=pl';
    this.loginProviderObj.options = options;
  }

  initialize(): Observable<GoogleUser> {
    return Observable.create((observer) => {
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
    const user: GoogleUser = new GoogleUser();
    const profile = this.auth2.currentUser.get().getBasicProfile();
    const authResponseObj = this.auth2.currentUser.get().getAuthResponse(true);
    user.id = profile.getId();
    user.name = profile.getName();
    user.email = profile.getEmail();
    user.image = profile.getImageUrl();
    user.token = authResponseObj.access_token;
    user.idToken = authResponseObj.id_token;
    return user;
  }

  signIn(): Observable<GoogleUser> {
    return Observable.create((observer) => {
      this.auth2.signIn().then(() => {
        observer.mext(this.drawUser());
      });
    });
  }

  signOut(): Observable<any> {
    return Observable.create((observer) => {
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
