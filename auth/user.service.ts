import { Injectable, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  usuario = {
    nombre: '',
    dni: ''
  }

  private _autenticado = true;
  public userProfile: KeycloakProfile | null = null;

  get autenticado() {
    return this._autenticado;
  }
 
  constructor(private ks: KeycloakService) {
    this.init();
  }

  public async init() {

    this._autenticado = await this.ks.isLoggedIn();

    if (this._autenticado) {
      this.userProfile = await this.ks.loadUserProfile();
      console.log('Profile: ', this.userProfile );
      await this.actualizaDatos();
    
    }
  }

  async logout() {
    console.log('Saliendo....');
    await this.ks.logout(environment.logout)
  }

  
  async actualizaDatos ()  {

    const token = (await this.ks.getToken()).toString();
    
    try {
      const data = JSON.parse(atob(token.split('.')[1]));
      this.usuario.nombre = data.name;
      this.usuario.dni = data.prueba;
      console.log(token);
    } catch (e) {
      console.log('Ha habido un error');
    }
  };



}
