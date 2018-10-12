import { Observable } from 'rxjs';
import { BaseLoginProvider } from '../entities/base-login-provider';
import { LoginProviderOptions } from '../entities/login-provider';
import { FbUser, LoginProviderClass } from '../entities/user';

declare let FB: any;

export class FacebookLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'facebook';
  public loginProviderObj: LoginProviderClass = new LoginProviderClass();
  private supportedLocales = ['pl_PL', 'en_US'];

  constructor(private clientId: string, public options: LoginProviderOptions = {}) {
    super();
    const locale = options && options.locale && this.supportedLocales.includes(options.locale);
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'facebook';
    this.loginProviderObj.url = `https://connect.facebook.net/${locale ? locale : 'en_US'}/sdk.js`;
    this.loginProviderObj.options = options;
  }

  static drawUser(response: any): FbUser {
    const user: FbUser = new FbUser();
    Object.assign(user, response);
    user.id = response.id;
    user.name = response.name;
    user.email = response.email;
    user.token = response.token;
    user.image = 'https://graph.facebook.com/' + response.id + '/picture?type=normal';
    return user;
  }

  initialize(): Observable<FbUser> {
    return Observable.create((observer) => {
      this.loadScript(this.loginProviderObj, () => {
        FB.init({
          appId: this.clientId,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: 'v3.1'
        });
        FB.AppEvents.logPageView();

        FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            const accessToken = FB.getAuthResponse()['accessToken'];
            const basePath = '/me?fields=name,email,picture,first_name,last_name';
            const additionalFields = this.parseFields(this.loginProviderObj.options);
            FB.api(`${basePath}${additionalFields ? ',' + additionalFields : ''}`, (res: any) => {
              observer.next(FacebookLoginProvider.drawUser(Object.assign({}, {token: accessToken}, res)));
            });
          }
        });
      });
    });
  }

  signIn(): Observable<FbUser> {
    const scope = this.parseScope(this.loginProviderObj.options);
    return Observable.create((observer) => {
      FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = FB.getAuthResponse()['accessToken'];
          const basePath = '/me?fields=name,email,picture,first_name,last_name';
          const additionalFields = this.parseFields(this.loginProviderObj.options);
          FB.api(`${basePath}${additionalFields ? ',' + additionalFields : ''}`, (res: any) => {
            observer.next(FacebookLoginProvider.drawUser(Object.assign({}, {token: accessToken}, res)));
          });
        }
      }, {scope: scope ? scope : 'email,public_profile'});
    });
  }

  signOut(): Observable<any> {
    return Observable.create((observer) => {
      FB.logout((response: any) => {
        observer.next(response);
      });
    });
  }

}
