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

import { NgModule } from '@angular/core';
import { CoreModule } from '../core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslations } from '../translation/translation.service';
import { AuthModule } from '../../../src/lib/auth/oidc/auth.module';

@NgModule({
    imports: [
        AuthModule.forRoot(),
        TranslateModule.forRoot(),
        CoreModule.forRoot(),
        BrowserAnimationsModule
    ],
    providers: [
        provideTranslations('adf-core', 'assets/adf-core')
    ]
})
export class CoreStoryModule { }
