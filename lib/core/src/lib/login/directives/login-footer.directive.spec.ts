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

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from '../components/login.component';
import { LoginFooterDirective } from './login-footer.directive';
import { CoreTestingModule } from '../../testing/core.testing.module';
import { TranslateModule } from '@ngx-translate/core';
import { OidcAuthenticationService } from '../../auth/services/oidc-authentication.service';

describe('LoginFooterDirective', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;
    let directive: LoginFooterDirective;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                CoreTestingModule
            ],
            providers: [
                {
                    provide: OidcAuthenticationService, useValue: {}
                }
            ]
        });
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        directive = new LoginFooterDirective(component);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('applies template to Login component', () => {
        const template: any = '';
        directive.template = template;
        directive.ngAfterContentInit();
        expect(component.footerTemplate).toBe(template);
    });
});
