import { Injectable } from '@angular/core';
import { AuthOptions, WebAuth } from 'auth0-js';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  protected _auth0Client: WebAuth;
  private _accessToken: string;
  private _idToken: string;
  private _properties: AuthOptions;

  constructor() {
    this._properties = {
      clientID: 'yUuUTDiYnJhxO1FD9ZT2WOLa6qluRYDn',
      domain: 'bk-tmp.auth0.com',
      responseType: 'token id_token',
      audience: 'http://localhost:3000',
      redirectUri: 'http://localhost:4200/login',
      scope: 'openid profile'
    };
    this._auth0Client = new WebAuth({...this._properties});
  }

  public login(): void {
    // triggers auth0 authentication page
    this._auth0Client.authorize();
  }

  public checkSession(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // checks in Auth0's server if the browser has a session
      this._auth0Client.checkSession(this._properties, async (error, authResult) => {
        if (error && error.error !== 'login_required') {
          // some other error
          return reject(error);
        } else if (error) {
          // explicit authentication
          console.log(error);
          this.handleAuthentication();
          return resolve(false);
        }
        if (!this.isAuthenticated()) {
          this._setSession(authResult);
          return resolve(true);
        }
      });
    });
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    return this._accessToken != null;
  }

  private handleAuthentication(): void {
    this._auth0Client.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this._setSession(authResult);
      } else if (err) {
        console.log(err);
      }
    });
  }

  private _setSession(authResult): void {
    this._accessToken = authResult.accessToken;
    this._idToken = authResult.idToken;
  }

  // check if there is a property Admin in access token
  public isAdmin(): boolean {
    if (this._accessToken) {
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(this._accessToken);
      if (decodedToken['http://localhost:3000/roles'].indexOf('admin') > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public getProfile(): Object {
    if (this._idToken) {
      const helper = new JwtHelperService();
      return helper.decodeToken(this._idToken);
    }
  }

  public getAccessToken(): String {
    return this._accessToken;
  }

  public logout(): void {
    // Remove tokens
    delete this._accessToken;
    delete this._idToken;
  }
}
