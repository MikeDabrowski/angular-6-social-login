import { BaseLoginProvider } from '../entities/base-login-provider';
import { FbUser, LoginProviderClass } from '../entities/user';
import { Observable } from 'rxjs';

declare let FB: any;

export class FacebookLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'facebook';
  public loginProviderObj: LoginProviderClass = new LoginProviderClass();

  constructor(private clientId: string) {
    super();
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'facebook';
    this.loginProviderObj.url = 'https://connect.facebook.net/en_US/sdk.js';
  }

  initialize(): Observable<FbUser> {
    return new Observable.create((observer) => {
      this.loadScript(this.loginProviderObj, () => {
          FB.init({
            appId: this.clientId,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: 'v2.10'
          });
          FB.AppEvents.logPageView();

          FB.getLoginStatus(function (response: any) {
            if (response.status === 'connected') {
              const accessToken = FB.getAuthResponse()['accessToken'];
              FB.api('/me?fields=name,email,picture,first_name,last_name', (res: any) => {
                observer.next(FacebookLoginProvider.drawUser(Object.assign({}, {token: accessToken}, res)));
              });
            }
          });
        });
    });
  }

  static drawUser(response: any): FbUser {
    let user: FbUser = new FbUser();
    user.id = response.id;
    user.name = response.name;
    user.email = response.email;
    user.token = response.token;
    user.firstName = response.firstName;
    user.lastName = response.lastName;
    user.image = 'https://graph.facebook.com/' + response.id + '/picture?type=normal';
    return user;
  }

  signIn(): Observable<FbUser> {
    return new Observable.create((observer) => {
      FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = FB.getAuthResponse()['accessToken'];
          FB.api('/me?fields=name,email,picture,first_name,last_name', (res: any) => {
            observer.next(FacebookLoginProvider.drawUser(Object.assign({}, {token: accessToken}, res)));
          });
        }
      }, { scope: 'email,public_profile' });
    });
  }

  signOut(): Observable<any> {
    return new Observable.create((observer) => {
      FB.logout((response: any) => {
        observer.next(response)
      });
    });
  }

}
