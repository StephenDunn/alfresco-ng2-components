/*!
 * @license
 * Copyright © 2005-2023 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { AuthConfig, AUTH_CONFIG, OAuthModule, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { AlfrescoApiNoAuthService } from '../../api-factories/alfresco-api-no-auth.service';
import { AlfrescoApiService } from '../../services/alfresco-api.service';
import { AuthenticationService } from '../services/authentication.service';
import { StorageService } from '../../common/services/storage.service';
import { AuthModuleConfig, AUTH_MODULE_CONFIG } from './auth-config';
import { authConfigFactory, AuthConfigService } from './auth-config.service';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthService } from './auth.service';
import { RedirectAuthService } from './redirect-auth.service';
import { AuthenticationConfirmationComponent } from './view/authentication-confirmation/authentication-confirmation.component';

/**
 * Create a Login Factory function
 *
 * @param oAuthService auth service
 * @param storage storage service
 * @param config auth configuration
 * @returns a factory function
 */
export function loginFactory(oAuthService: OAuthService, storage: OAuthStorage, config: AuthConfig) {
    const service = new RedirectAuthService(oAuthService, storage, config);
    return () => service.init();
}

@NgModule({
    declarations: [AuthenticationConfirmationComponent],
    imports: [AuthRoutingModule, OAuthModule.forRoot()],
    providers: [
        { provide: OAuthStorage, useExisting: StorageService },
        { provide: AuthenticationService},
        { provide: AlfrescoApiService, useClass: AlfrescoApiNoAuthService },
        {
            provide: AUTH_CONFIG,
            useFactory: authConfigFactory,
            deps: [AuthConfigService]
        },
        RedirectAuthService,
        { provide: AuthService, useExisting: RedirectAuthService },
        {
            provide: APP_INITIALIZER,
            useFactory: loginFactory,
            deps: [OAuthService, OAuthStorage, AUTH_CONFIG],
            multi: true
        }
    ]
})
export class AuthModule {
    static forRoot(config: AuthModuleConfig = { useHash: false }): ModuleWithProviders<AuthModule> {
        config.preventClearHashAfterLogin = config.preventClearHashAfterLogin ?? true;
        return {
            ngModule: AuthModule,
            providers: [{ provide: AUTH_MODULE_CONFIG, useValue: config }]
        };
    }
}
