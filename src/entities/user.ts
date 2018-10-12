export class SocialUser {
  provider: string;
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  image: string;
  token?: string;
  idToken?: string
}

export class LoginProviderClass {
  name: string;
  id: string;
  url: string;
}

export class LinkedInResponse {
  emailAddress: string;
  firstName: string;
  id: string;
  lastName: string;
  pictureUrl: string;
}

export class FbUser extends SocialUser {
}

export class GoogleUser extends SocialUser {
}

export class LinkedInUser extends SocialUser {
}
