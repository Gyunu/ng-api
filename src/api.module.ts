import { NgModule, ErrorHandler, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

/*
  Services
*/
import { ApiService } from './services/api.service';

/*
  Contracts
*/
import { ROUTES } from './contracts/routes.contract';
import { CONFIG } from './contracts/config.contract';
import { ApiConfig } from './contracts/config.contract';

@NgModule({
  declarations: [
  ],
  bootstrap: [],
  exports: [],
  imports: [
    HttpModule
  ],
  entryComponents: [],
  providers: []
})
export class ApiModule {

  static forRoot(routes: any, config: ApiConfig): ModuleWithProviders {
    return {
      ngModule: ApiModule,
      providers: [
        {provide: ROUTES, useValue: routes},
        {provide: CONFIG, useValue: config},
        {provide: ApiService, useClass: ApiService}
      ]
    }
  }

}
