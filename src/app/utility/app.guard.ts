import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakEvent, KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { KeycloakLoginOptions } from 'keycloak-js';
import { setTimeout } from 'timers';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
    constructor(
        protected readonly router: Router,
        protected readonly keycloak: KeycloakService
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<any> {
        // Force the user to log in if currently unauthenticated.
        if (!this.authenticated) {
            this.keycloak.isLoggedIn().then((login)=>{
                if(!login)
                {
                    localStorage.removeItem('token');
                    localStorage.removeItem('entity');
                }
            this.keycloak
                .getKeycloakInstance()
                .login(<KeycloakLoginOptions>{
                    locale: localStorage.getItem('setLanguage'),
                    redirectUri: window.location.origin + state.url
                })
                .then((res) => {
                    console.log({ res });
                });
            }) ;
        } else {
            const localEntity = localStorage.getItem("entity");
            const routeEntity = route.paramMap.get("entity");

            if (localEntity && routeEntity) {
                if (localEntity !== routeEntity) {
                    this.router.navigate(['/not-found'])
                }
            }
        }

         
        // Get the roles required from the route.
        const requiredRoles = route.data.roles;

        // Allow the user to to proceed if no additional roles are required to access the route.
        if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
            return true;
        }

        // Allow the user to proceed if all the required roles are present.
        return requiredRoles.every((role) => this.roles.includes(role));
    }
}