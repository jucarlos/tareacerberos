
![Angular Logo](img\Angular_full_color_logo250.png) 

# Tarea Angular - Cerberos

Se trata de crear una aplicación angular que está alinieada con la aplicación que genera el marco corporativo.
Esta aplicación tendrá dos páginas en un módulo público y otras dos páginas en un módulo privado.
Para entrar en las páginas de módulo público no hace falta autenticación y para las páginas del módulo privado es necesario autenticarse con Cerberos.

## Habría que seguir estos pasos:

### 1. Creación de la aplicación Angular

En la creación, voy a poner que se llama appcerberos

```
ng new appcerberos
```

### 2. Cambios en el fichero tsconfig
En esta aplicación, hay que hacer un cambio en el fichero tsconfig.ts.
Concretamente incluir esta línea en compilerOptions
```
"allowSyntheticDefaultImports": true
```

### 3. Adaptamos la aplicación que nos genera
En este punto habría que:

* Instalar bootstrap. Se puede hacer con el css del cdn.
* Borrar el contenido de app.componente.html y poner por ejemplo :
```
<h1>Cerberos</h1>
```
con el único fin de comprobar si está bien instalado bootstrap. 
Tenemos que ver que efectivamente la fuente cambia a bootstrap.

### 4. Instalaciones adicionales
Esta aplicación utiliza las librerías de keycloak

```
npm i keycloak-angular keycloak-js
```


### 5. Creación de los módulos de la aplicación

Crearemos los siguientes módulos incluyendo los ficheros de rutas.

* Módulo público
```
ng g m publico --routing
```
* Módulo privado
```
ng g m privado --routing

```
* Módulo para tener centralizada la autorización/autenticación.
```
ng g m auth
```


### 6. Creación de componentes páginas.

1. Creación de dos componentes páginas llamadas home, paginaUno y paginaDos en el módulo privado y los mismos en el público

```
ng g c publico/home
ng g c publico/paginaUno
ng g c publico/paginaDos

ng g c privado/home
ng g c privado/paginaUno
ng g c privado/paginaDos

```

2. Vamos a crear un componente en una carpeta de componentes compartidos para tener un footer con el nombre de usuario autenticado que devuelve Cerberos.

```
ng g c shared/footer
```

### 7. Creando un guard que estará pendiente para el acceso

```
ng g g auth/auth
```
Si nos pide que tipo de implementación aceptamos cualquiere. Luego se va a cambiar.

### 8. En la carpeta auth, tienen que estar los fichero que están en la carpet auth de esta tarea.
Concretamented, lo que hay es:

* La descripción del módulo
* El fichero del guard,
* Los ficheros de configuración de keycloak ( config-init y keycloak init factory) y un servicio para ir controlando si el usuario está autenticado, etc

Habría que abrirlos para comprobar que no hay errores.

### 9. Configurando rutas:

Rutas principales app.routing-module.ts

```

const routes: Routes = [
  {
    path: 'homepublico',
    loadChildren: () => import('./publico/publico.module').then( m => m.PublicoModule)
  },
  {
    path: 'homeprivado',
    canActivate: [ AuthGuard ],
    loadChildren: () => import('./privado/privado.module').then( m => m.PrivadoModule),
  },
  {
    path: '**',
    redirectTo: 'homepublico'
  }
];

```

Rutas del módulo público:

```

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
          { path: 'una', component: PaginaUnoComponent },
          { path: 'dos', component: PaginaDosComponent },
          { path: '**', redirectTo: ''}
        ]
    }
];
```

Rutas del módulo privado:

```

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
          { path: 'una', component: PaginaUnoComponent },
          { path: 'dos', component: PaginaDosComponent },
          { path: '**', redirectTo: ''}
        ]
    }
];


```

### 10. Creación de la estructura para inyectar en el despliegue la configuración

El proyecto tiene que tener debajo de la carpeta app una carpeta llamada __k8s__ , dentro de esta carpeta tendrá otras tres carpetas llamadas 'des', 'pre', 'pro'.

Dentro de cada una de esas carpetas se crean las carpetas cm/frontconfig y el contenido de esta última carpeta es un fichero llamado keycloak.json con este contenido:

```
{
    "url": "https://sso-cerbero-pre.cm-pre.jccm.es",
    "realm": "usuarios",
    "clientId": "dashboard"
    
}

```

### 11. Carpeta assest/config

En la carpeta assest del proyecto, hay que crear otra carpeta llamada config con un fichero llamado keycloak.json y que tendrá el mismo contenido que el fichero anterior.

### 12. Configuración del fichero environment.

Hay que incluir estos parámetros dentro del objeto environment. Así quedaría por ejemplo el de desarrollo:

```
export const environment = {
  production: false,
  configFile: 'assets/config/keycloak.json',
  logout: "http://localhost:4200/homepublico"
};
```

### 13. Configuración de app.module.

* Hay que incorporar el módulo de peticiones http.

Para ello, en los import del módulo hay que incluir:

```
HttpClientModule
```
Recuerdo que ese módulo no se incluye en la creación de un proyecto y por lo tanto tiene que ser importado
```
import { HttpClientModule } from '@angular/common/http';
```

* Incorporar el módulo de KeyCloak

De la misma forma que la anterior, hay que incluir en los import del módulo el de KeyCloak

```
KeycloakAngularModule
```
Si no importa en la clase este módulo de "keycloak-angular", lo pondríamos nosotros:
```
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
```

* Providers de app.module.ts
En los providers, tiene que aparecer esto
```
 providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [ KeycloakService, ConfigInitService ]
  }],

```
Ojo, que habrá que hacer alguna importación.

Si no lo hace automático, serían
1. Incluir APP_INITIALIZER en la importación de @angular/core

2. Algo así para los servicios:
```
import { initializeKeycloak } from './auth/keycloak-init.factory';
import { ConfigInitService } from './auth/config-init.service';
```


### 14. Contenido de los componentes

* styles.css

```

footer {
    position: absolute;
    bottom: 20px;
    width: 70%;
    box-shadow: 1px 1px 1px 1px rgba(32, 31, 31, 0.287);
}
```


* footer 
El fichero html tendría:
```
<footer class="bg-light rounded-top">
    <div class="container py-2">
        <span *ngIf="user.autenticado" class="text-dark" >Autenticado: {{ user.usuario.nombre }} -  {{ user.usuario.dni }} </span>
        <span *ngIf="!user.autenticado" class="text-danger" >No autenticado</span>
    </div>
</footer>
```
En el fichero ts, únicamente inyectar el servicio de usuario
```
 constructor(public user: UserService) { }
```
Recordar que hay que importar

* Módulo Público 

Home Html

```

<div class="row  mt-2">

    
<h3>Parte pública</h3>
<hr>

<div class="row">
    <div class="col">
        <button class="btn btn-outline-primary"
            routerLinkActive="active"
            routerLink="una">Página 1</button>
        <button class="btn btn-outline-primary mx-3"
            routerLinkActive="active"
            routerLink="dos">Página 2</button>
    </div>

    <div class="row">
        <div class="col">
            <div class="mt-3">
                <router-outlet></router-outlet>
            </div>
        </div>
    </div>
</div>

</div>

```

Home Ts nada

Nome Css nada.

Las página uno y dos, se quedan como están


* Módulo Privado.

HTML - Home

```

<div class="row  mt-2">
   
    <h3>Parte privada</h3>
    <hr>
    
    <div class="row">
        <div class="col">
            <button class="btn btn-outline-primary"
                routerLinkActive="active"
                routerLink="una">Página 1</button>
            <button class="btn btn-outline-primary mx-3"
                routerLinkActive="active"
                routerLink="dos">Página 2</button>
        </div>
    
        <div class="row">
            <div class="col">
                <div class="mt-3">
                    <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    </div>
    
    </div>
    

```

* Componente principal app

En app.component.ts

Hay que inyectar en el constructor y crear una función salir. Sería algo así:
```
constructor(private user: UserService) {}


  salir() {
    this.user.logout();
  }

```

El fichero app.component.html tiene que quedar así:

```

<div class="container">

<div class="row mt-2">
  <h2>Autenticación con Cerberos</h2>
  <hr />

  <div class="row mt-3">
    <div class="col-sm-4">
      <h3>Parte pública</h3>
      <hr />
        <button 
          class="btn btn-outline-primary mb-3"
          routerLink="homepublico"
          >Bienvenida</button>
      <h4>Parte privada</h4>
      <hr />
        <button class="btn btn-outline-warning"
        routerLink="homeprivado">Entrar</button>

        <hr />
        <button class="btn btn-outline-danger"
        (click)="salir()">Salir</button>
    </div>

    <div class="col-sm">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>

<app-footer></app-footer>

</div>

```


### 15 - PROBANDO . ¡SUERTE!