import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigInitService {

  private config: any;

  constructor(private httpClient: HttpClient) { }

  public getConfig(): Observable<any> {
    return this.httpClient
        .get(this.getConfigFile(), {
          observe: 'response',
        })
        .pipe(
          catchError((error) => {
            console.log(error)
            return of(null)
          } ),
          mergeMap((response) => {
            if (response && response.body) {
              // console.log( response );
              this.config = response.body;
              return of(this.config);
            } else {
              return of(null);
            }
          }));
  }

  
  private getConfigFile(): string {
    return environment.configFile
  }

  

}
