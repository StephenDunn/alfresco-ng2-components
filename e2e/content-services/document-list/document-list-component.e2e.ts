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

import { ContentServicesPage } from '../../core/pages/content-services.page';
import { browser } from 'protractor';
import { createApiService, LoginPage, StringUtil, UploadActions, UserModel, UsersActions } from '@alfresco/adf-testing';
import { FileModel } from '../../models/ACS/file.model';
import { NavigationBarPage } from '../../core/pages/navigation-bar.page';
import { NodeEntry } from '@alfresco/js-api';

describe('Document List Component', () => {
    let uploadedFolder: NodeEntry;
    let uploadedFolderExtra: NodeEntry;

    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();

    const contentServicesPage = new ContentServicesPage();
    const apiService = createApiService();
    const usersActions = new UsersActions(apiService);

    const uploadActions = new UploadActions(apiService);
    let acsUser: UserModel = null;
    let testFileNode: NodeEntry;
    let pdfBFileNode: NodeEntry;

    afterEach(async () => {
        await apiService.loginWithProfile('admin');
        if (uploadedFolder) {
            await uploadActions.deleteFileOrFolder(uploadedFolder.entry.id);
            uploadedFolder = null;
        }
        if (uploadedFolderExtra) {
            await uploadActions.deleteFileOrFolder(uploadedFolderExtra.entry.id);
            uploadedFolderExtra = null;
        }
        if (testFileNode) {
            await uploadActions.deleteFileOrFolder(testFileNode.entry.id);
            testFileNode = null;
        }
        if (pdfBFileNode) {
            await uploadActions.deleteFileOrFolder(pdfBFileNode.entry.id);
            pdfBFileNode = null;
        }
    });

    describe('Custom Column', () => {
        let folderName: string;

        const pdfFileModel = new FileModel({
            name: browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_name,
            location: browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_path
        });
        const docxFileModel = new FileModel({
            name: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_name,
            location: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_path
        });

        let pdfUploadedNode: NodeEntry;
        let docxUploadedNode: NodeEntry;
        let timeAgoUploadedNode: NodeEntry;
        let mediumDateUploadedNode: NodeEntry;

        beforeAll(async () => {
            /* cspell:disable-next-line */
            folderName = `MEESEEKS_${StringUtil.generateRandomString(5)}_LOOK_AT_ME`;

            await apiService.loginWithProfile('admin');

            acsUser = await usersActions.createUser();

            await apiService.login(acsUser.username, acsUser.password);
            uploadedFolder = await uploadActions.createFolder(folderName, '-my-');
            pdfUploadedNode = await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, '-my-');
            docxUploadedNode = await uploadActions.uploadFile(docxFileModel.location, docxFileModel.name, '-my-');
        });

        afterAll(async () => {
            await apiService.loginWithProfile('admin');

            if (pdfUploadedNode) {
                await uploadActions.deleteFileOrFolder(pdfUploadedNode.entry.id);
            }
            if (docxUploadedNode) {
                await uploadActions.deleteFileOrFolder(docxUploadedNode.entry.id);
            }
            if (timeAgoUploadedNode) {
                await uploadActions.deleteFileOrFolder(timeAgoUploadedNode.entry.id);
            }
            if (mediumDateUploadedNode) {
                await uploadActions.deleteFileOrFolder(mediumDateUploadedNode.entry.id);
            }
        });

        beforeEach(async () => {
            await loginPage.login(acsUser.username, acsUser.password);
        });

        afterEach(async () => {
            await navigationBarPage.clickLogoutButton();
        });

        it("[C279926] Should only display the user's files and folders", async () => {
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkContentIsDisplayed(folderName);
            await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            await contentServicesPage.checkContentIsDisplayed(docxFileModel.name);
            await expect(await contentServicesPage.getDocumentListRowNumber()).toBe(4);
        });

        it('[C279927] Should display default columns', async () => {
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkColumnNameHeader();
            await contentServicesPage.checkColumnSizeHeader();
            await contentServicesPage.checkColumnCreatedByHeader();
            await contentServicesPage.checkColumnCreatedHeader();
        });
    });

    describe('Column Sorting', () => {
        const fakeFileA = new FileModel({
            name: 'A',
            location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_path
        });

        const fakeFileB = new FileModel({
            name: 'B',
            location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_path
        });

        const fakeFileC = new FileModel({
            name: 'C',
            location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_path
        });

        let fileANode: NodeEntry;
        let fileBNode: NodeEntry;
        let fileCNode: NodeEntry;

        beforeAll(async () => {
            await apiService.loginWithProfile('admin');

            const user = await usersActions.createUser();
            await apiService.login(user.username, user.password);

            fileANode = await uploadActions.uploadFile(fakeFileA.location, fakeFileA.name, '-my-');
            fileBNode = await uploadActions.uploadFile(fakeFileB.location, fakeFileB.name, '-my-');
            fileCNode = await uploadActions.uploadFile(fakeFileC.location, fakeFileC.name, '-my-');

            await loginPage.login(user.username, user.password);

            await contentServicesPage.goToDocumentList();
        });

        afterAll(async () => {
            await navigationBarPage.clickLogoutButton();

            await apiService.loginWithProfile('admin');
            if (fileANode) {
                await uploadActions.deleteFileOrFolder(fileANode.entry.id);
            }
            if (fileBNode) {
                await uploadActions.deleteFileOrFolder(fileBNode.entry.id);
            }
            if (fileCNode) {
                await uploadActions.deleteFileOrFolder(fileCNode.entry.id);
            }
        });

        it('[C260112] Should be able to sort by name (Ascending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByName('asc')).toBe(true, 'List is not sorted.');
        });

        it('[C272770] Should be able to sort by name (Descending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByName('desc')).toBe(true, 'List is not sorted.');
        });

        it('[C272771] Should be able to sort by author (Ascending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByAuthor('asc')).toBe(true, 'List is not sorted.');
        });

        it('[C272772] Should be able to sort by author (Descending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByAuthor('desc')).toBe(true, 'List is not sorted.');
        });

        it('[C272773] Should be able to sort by date (Ascending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByCreated('asc')).toBe(true, 'List is not sorted.');
        });

        it('[C272774] Should be able to sort by date (Descending)', async () => {
            await expect(await contentServicesPage.sortAndCheckListIsOrderedByCreated('desc')).toBe(true, 'List is not sorted.');
        });
    });

    describe('', () => {
        afterEach(async () => {
            await navigationBarPage.clickLogoutButton();
        });

        it('[C279959] Should display empty folder state for new folders', async () => {
            const folderName = 'BANANA';
            await apiService.loginWithProfile('admin');
            acsUser = await usersActions.createUser();

            await loginPage.login(acsUser.username, acsUser.password);
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.createNewFolder(folderName);
            await contentServicesPage.openFolder(folderName);
            await contentServicesPage.checkEmptyFolderTextToBe('This folder is empty');
            await contentServicesPage.checkEmptyFolderImageUrlToContain('/assets/images/empty_doc_lib.svg');
        });

        it('[C272775] Should be able to upload a file in new folder', async () => {
            const testFile = new FileModel({
                name: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_name,
                location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_location
            });
            /* cspell:disable-next-line */
            const folderName = `MEESEEKS_${StringUtil.generateRandomString(5)}_LOOK_AT_ME`;
            await apiService.loginWithProfile('admin');
            acsUser = await usersActions.createUser();
            await apiService.login(acsUser.username, acsUser.password);
            uploadedFolder = await uploadActions.createFolder(folderName, '-my-');

            await loginPage.login(acsUser.username, acsUser.password);
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkContentIsDisplayed(uploadedFolder.entry.name);
            await contentServicesPage.openFolder(uploadedFolder.entry.name);
            await contentServicesPage.uploadFile(testFile.location);
            await contentServicesPage.checkContentIsDisplayed(testFile.name);
        });

        it('[C279970] Should display Islocked field for folders', async () => {
            const folderNameA = `MEESEEKS_${StringUtil.generateRandomString(5)}_LOOK_AT_ME`;
            const folderNameB = `MEESEEKS_${StringUtil.generateRandomString(5)}_LOOK_AT_ME`;
            await apiService.loginWithProfile('admin');
            acsUser = await usersActions.createUser();
            await apiService.login(acsUser.username, acsUser.password);
            uploadedFolder = await uploadActions.createFolder(folderNameA, '-my-');
            uploadedFolderExtra = await uploadActions.createFolder(folderNameB, '-my-');

            await loginPage.login(acsUser.username, acsUser.password);
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkContentIsDisplayed(folderNameA);
            await contentServicesPage.checkContentIsDisplayed(folderNameB);
            await contentServicesPage.checkLockIsDisplayedForElement(folderNameA);
            await contentServicesPage.checkLockIsDisplayedForElement(folderNameB);
        });

        it('[C269086] Should display IsLocked field for files', async () => {
            const testFileA = new FileModel({
                name: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_name,
                location: browser.params.resources.Files.ADF_DOCUMENTS.TEST.file_path
            });
            const testFileB = new FileModel({
                name: browser.params.resources.Files.ADF_DOCUMENTS.PDF_B.file_name,
                location: browser.params.resources.Files.ADF_DOCUMENTS.PDF_B.file_path
            });
            await apiService.loginWithProfile('admin');
            acsUser = await usersActions.createUser();
            await apiService.login(acsUser.username, acsUser.password);
            testFileNode = await uploadActions.uploadFile(testFileA.location, testFileA.name, '-my-');
            pdfBFileNode = await uploadActions.uploadFile(testFileB.location, testFileB.name, '-my-');

            await loginPage.login(acsUser.username, acsUser.password);
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkContentIsDisplayed(testFileA.name);
            await contentServicesPage.checkContentIsDisplayed(testFileB.name);
            await contentServicesPage.checkLockIsDisplayedForElement(testFileA.name);
            await contentServicesPage.checkLockIsDisplayedForElement(testFileB.name);
        });
    });

    describe('Once uploaded 20 folders', () => {
        let folderCreated: NodeEntry[];

        beforeAll(async () => {
            folderCreated = [];
            await apiService.loginWithProfile('admin');
            acsUser = await usersActions.createUser();
            await apiService.login(acsUser.username, acsUser.password);
            let folderName = '';
            let folder = null;

            for (let i = 0; i < 20; i++) {
                folderName = `MEESEEKS_000${i}`;
                folder = await uploadActions.createFolder(folderName, '-my-');
                folderCreated.push(folder);
            }
        });

        afterAll(async () => {
            await apiService.loginWithProfile('admin');
            for (const item of folderCreated) {
                await uploadActions.deleteFileOrFolder(item.entry.id);
            }
            await navigationBarPage.clickLogoutButton();
        });

        it('[C277093] Should sort files with Items per page set to default', async () => {
            await navigationBarPage.clickLogoutButton();
            await loginPage.login(acsUser.username, acsUser.password);
            await contentServicesPage.goToDocumentList();
            await contentServicesPage.checkListIsSortedByNameColumn('asc');
        });
    });
});
