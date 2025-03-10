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

import { TranslationService, CustomEmptyContentTemplateDirective } from '@alfresco/adf-core';
import { AppsProcessService } from './services/apps-process.service';
import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output, ContentChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, Observer, of, Subject } from 'rxjs';
import { AppDefinitionRepresentationModel } from '../task-list';
import { IconModel } from './icon.model';
import { share, takeUntil, finalize } from 'rxjs/operators';
import { AppDefinitionRepresentation } from '@alfresco/js-api';

const DEFAULT_TASKS_APP: string = 'tasks';
const DEFAULT_TASKS_APP_NAME: string = 'ADF_TASK_LIST.APPS.TASK_APP_NAME';
const DEFAULT_TASKS_APP_THEME: string = 'theme-2';
const DEFAULT_TASKS_APP_ICON: string = 'glyphicon-asterisk';

export const APP_LIST_LAYOUT_LIST: string = 'LIST';
export const APP_LIST_LAYOUT_GRID: string = 'GRID';

@Component({
    selector: 'adf-apps',
    templateUrl: './apps-list.component.html',
    styleUrls: ['./apps-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'adf-apps' }
})
export class AppsListComponent implements OnInit, AfterContentInit, OnDestroy {
    @ContentChild(CustomEmptyContentTemplateDirective)
    emptyCustomContent: CustomEmptyContentTemplateDirective;

    /**
     * Defines the layout of the apps. There are two possible
     * values, "GRID" and "LIST".
     */
    @Input()
    layoutType: string = APP_LIST_LAYOUT_GRID;

    /** Provides a way to filter the apps to show. */
    @Input()
    filtersAppId: any[];

    /** Emitted when an app entry is clicked. */
    @Output()
    appClick = new EventEmitter<AppDefinitionRepresentationModel>();

    /** Emitted when an error occurs. */
    @Output()
    error = new EventEmitter<any>();

    apps$: Observable<AppDefinitionRepresentationModel>;
    currentApp: AppDefinitionRepresentationModel;
    appList: AppDefinitionRepresentationModel[] = [];
    loading: boolean = false;
    hasEmptyCustomContentTemplate: boolean = false;

    private appsObserver: Observer<AppDefinitionRepresentation>;
    private iconsMDL: IconModel;
    private onDestroy$ = new Subject<boolean>();

    constructor(private appsProcessService: AppsProcessService, private translationService: TranslationService) {
        this.apps$ = new Observable<AppDefinitionRepresentationModel>((observer) => (this.appsObserver = observer)).pipe(share());
    }

    ngOnInit() {
        if (!this.isValidType()) {
            this.setDefaultLayoutType();
        }

        this.apps$.pipe(takeUntil(this.onDestroy$)).subscribe((app) => this.appList.push(app));

        this.iconsMDL = new IconModel();
        this.load();
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    ngAfterContentInit() {
        if (this.emptyCustomContent) {
            this.hasEmptyCustomContentTemplate = true;
        }
    }

    isDefaultApp(app: AppDefinitionRepresentation): boolean {
        return app.defaultAppId === DEFAULT_TASKS_APP;
    }

    getAppName(app: AppDefinitionRepresentationModel): Observable<string> {
        return this.isDefaultApp(app) ? this.translationService.get(DEFAULT_TASKS_APP_NAME) : of(app.name);
    }

    /**
     * Pass the selected app as next
     *
     * @param app application model
     */
    selectApp(app: AppDefinitionRepresentationModel) {
        this.currentApp = app;
        this.appClick.emit(app);
    }

    /**
     * Return true if the appId is the current app
     *
     * @param appId application id
     * @returns `true` if application is selected, otherwise `false`
     */
    isSelected(appId: number): boolean {
        return this.currentApp !== undefined && appId === this.currentApp.id;
    }

    /**
     * Check if the value of the layoutType property is an allowed value
     *
     * @returns `true` if layout type is valid, otherwise `false`
     */
    isValidType(): boolean {
        return this.layoutType && (this.layoutType === APP_LIST_LAYOUT_LIST || this.layoutType === APP_LIST_LAYOUT_GRID);
    }

    /**
     * Assign the default value to LayoutType
     */
    setDefaultLayoutType(): void {
        this.layoutType = APP_LIST_LAYOUT_GRID;
    }

    /**
     * Check if the layout type is LIST
     *
     * @returns `true` if current layout is in the list mode, otherwise `false`
     */
    isList(): boolean {
        return this.layoutType === APP_LIST_LAYOUT_LIST;
    }

    /**
     * Check if the layout type is GRID
     *
     * @returns `true` if current layout is in the grid mode, otherwise `false`
     */
    isGrid(): boolean {
        return this.layoutType === APP_LIST_LAYOUT_GRID;
    }

    isEmpty(): boolean {
        return this.appList.length === 0;
    }

    isLoading(): boolean {
        return this.loading;
    }

    getTheme(app: AppDefinitionRepresentationModel): string {
        return app.theme ? app.theme : '';
    }

    getBackgroundIcon(app: AppDefinitionRepresentationModel): string {
        return this.iconsMDL.mapGlyphiconToMaterialDesignIcons(app.icon);
    }

    private load() {
        this.loading = true;
        this.appsProcessService
            .getDeployedApplications()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(
                (res) => {
                    this.filterApps(res).forEach((app) => {
                        if (this.isDefaultApp(app)) {
                            app.theme = DEFAULT_TASKS_APP_THEME;
                            app.icon = DEFAULT_TASKS_APP_ICON;
                            this.appsObserver.next(app);
                        } else if (app.deploymentId) {
                            this.appsObserver.next(app);
                        }
                    });
                },
                (err) => {
                    this.error.emit(err);
                }
            );
    }

    private filterApps(apps: AppDefinitionRepresentation[]): AppDefinitionRepresentation[] {
        if (this.filtersAppId) {
            const filteredApps: AppDefinitionRepresentation[] = [];

            apps.forEach((app) => {
                this.filtersAppId.forEach((filter) => {
                    if (
                        app.defaultAppId === filter.defaultAppId ||
                        app.deploymentId === filter.deploymentId ||
                        app.name === filter.name ||
                        app.id === filter.id ||
                        app.modelId === filter.modelId ||
                        app.tenantId === filter.tenantId
                    ) {
                        filteredApps.push(app);
                    }
                });
            });

            return filteredApps;
        }

        return apps;
    }
}
