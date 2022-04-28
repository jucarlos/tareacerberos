import { KeycloakService } from 'keycloak-angular';
import {  of  } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ConfigInitService } from './config-init.service';

// export function initializeKeycloak(
//   keycloak: KeycloakService
//   ) {
//     return () =>
//       keycloak
//       .init({
//         config: {
//           url: 'https://sso-cerbero-pre.cm-pre.jccm.es' + '/auth',
//           realm: 'usuarios',
//           clientId: 'dashboard',
//         },
//         initOptions: {
//          // onLoad: 'login-required',
//           checkLoginIframe: false,
//         },
//         bearerExcludedUrls: ['/assets', '/homepublico'],

//       })
//       ;
//   }

export function initializeKeycloak(
  keycloak: KeycloakService,
  configService: ConfigInitService
  ) {
    return () =>
      configService.getConfig()
        .pipe(
          switchMap<any, any>(({ url, realm, clientId } ) => {
           return of(
             keycloak.init({
              config: {
                url: url + '/auth',
                realm,
                clientId
              },
              initOptions: {
                onLoad: 'check-sso',
                checkLoginIframe: false,
              },
              bearerExcludedUrls: ['/assets', '/homepublico'],
            }))
          })
        ).toPromise()
}