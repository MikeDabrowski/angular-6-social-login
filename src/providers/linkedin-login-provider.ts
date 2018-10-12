import { BaseLoginProvider } from '../entities/base-login-provider';
import { LinkedInUser, LoginProviderClass, LinkedInResponse } from '../entities/user';
import { Observable } from 'rxjs';

declare let IN: any;

export class LinkedinLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'linkedin';
  public loginProviderObj: LoginProviderClass = new LoginProviderClass();

  constructor(private clientId: string) {
    super();
    this.loginProviderObj.id = clientId;
    this.loginProviderObj.name = 'linkedin';
    this.loginProviderObj.url = 'https://platform.linkedin.com/in.js';
  }

  initialize(): Observable<LinkedInUser> {
    return new Observable.create((observer) => {
      this.loadScript(this.loginProviderObj, () => {
          IN.init({
            api_key: this.clientId,
            authorize: true,
            onLoad: this.onLinkedInLoad()
          });

          IN.Event.on(IN, 'auth', () => {
            if (IN.User.isAuthorized()) {
              IN.API.Raw(
                '/people/~:(id,first-name,last-name,email-address,picture-url)'
              ).result( (res: LinkedInResponse) => {
                observer.next(this.drawUser(res));
              });
            }
          });

        });
    });
  }

  onLinkedInLoad() {
    IN.Event.on(IN, 'systemReady', () => {
      IN.User.refresh();
    });
  }

  drawUser(response: LinkedInResponse): LinkedInUser {
    let user: LinkedInUser = new LinkedInUser();
    user.id = response.emailAddress;
    user.name = response.firstName + ' ' + response.lastName;
    user.firstName = response.firstName;
    user.lastName = response.lastName;
    user.email = response.emailAddress;
    user.image = response.pictureUrl;
    user.token = IN.ENV.auth.oauth_token;
    return user;
  }

  signIn(): Observable<LinkedInUser> {
    return new Observable.create((observer) => {
      IN.User.authorize( () => {
        IN.API.Raw('/people/~:(id,first-name,last-name,email-address,picture-url)').result( (res: LinkedInResponse) => {
          observer.next(this.drawUser(res));
        });
      });
    });
  }

  signOut(): Observable<any> {
    return new Observable.create((observer) => {
      IN.User.logout((response: any) => {
        observer.next(response);
      }, (err: any) => {
        observer.error(err);
      });
    });
  }

}
