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

import { browser, by, element, protractor } from 'protractor';
import { createApiService, BrowserActions, LoginPage, UploadActions, UserModel, UsersActions, ViewerPage } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../core/pages/content-services.page';
import { FileModel } from '../../models/ACS/file.model';
import { NavigationBarPage } from '../../core/pages/navigation-bar.page';
import { VersionManagePage } from '../pages/version-manager.page';
import { MetadataViewPage } from '../../core/pages/metadata-view.page';

describe('Content Services Viewer', () => {
    const acsUser = new UserModel();
    const viewerPage = new ViewerPage();
    const contentServicesPage = new ContentServicesPage();
    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    const versionManagePage = new VersionManagePage();
    const metadataViewPage = new MetadataViewPage();

    const pdfFile = new FileModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_name,
        firstPageText: browser.params.resources.Files.ADF_DOCUMENTS.PDF.first_page_text,
        secondPageText: browser.params.resources.Files.ADF_DOCUMENTS.PDF.second_page_text,
        lastPageNumber: browser.params.resources.Files.ADF_DOCUMENTS.PDF.last_page_number
    });
    const protectedFile = new FileModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.file_name,
        firstPageText: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.first_page_text,
        secondPageText: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.second_page_text,
        lastPageNumber: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.last_page_number,
        password: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.password,
        location: browser.params.resources.Files.ADF_DOCUMENTS.PDF_PROTECTED.file_path
    });
    const docxFile = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_path,
        name: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_name,
        firstPageText: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.first_page_text
    });
    const jpgFile = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.JPG.file_path,
        name: browser.params.resources.Files.ADF_DOCUMENTS.JPG.file_name
    });
    const mp4File = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.MP4.file_path,
        name: browser.params.resources.Files.ADF_DOCUMENTS.MP4.file_name
    });
    const unsupportedFile = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.UNSUPPORTED.file_path,
        name: browser.params.resources.Files.ADF_DOCUMENTS.UNSUPPORTED.file_name
    });
    const unsupportedFileByLocation = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.UNSUPPORTED.file_location,
        name: browser.params.resources.Files.ADF_DOCUMENTS.UNSUPPORTED.file_name
    });
    const pptFile = new FileModel({
        location: browser.params.resources.Files.ADF_DOCUMENTS.PPT.file_path,
        name: browser.params.resources.Files.ADF_DOCUMENTS.PPT.file_name,
        firstPageText: browser.params.resources.Files.ADF_DOCUMENTS.PPT.first_page_text
    });

    const apiService = createApiService();
    const usersActions = new UsersActions(apiService);
    const uploadActions = new UploadActions(apiService);

    beforeAll(async () => {
        await apiService.loginWithProfile('admin');

        await usersActions.createUser(acsUser);

        await apiService.login(acsUser.username, acsUser.password);

        const pdfFileUploaded = await uploadActions.uploadFile(pdfFile.location, pdfFile.name, '-my-');
        Object.assign(pdfFile, pdfFileUploaded.entry);

        const protectedFileUploaded = await uploadActions.uploadFile(protectedFile.location, protectedFile.name, '-my-');
        Object.assign(protectedFile, protectedFileUploaded.entry);

        const docxFileUploaded = await uploadActions.uploadFile(docxFile.location, docxFile.name, '-my-');
        Object.assign(docxFile, docxFileUploaded.entry);

        const jpgFileUploaded = await uploadActions.uploadFile(jpgFile.location, jpgFile.name, '-my-');
        Object.assign(jpgFile, jpgFileUploaded.entry);

        const mp4FileUploaded = await uploadActions.uploadFile(mp4File.location, mp4File.name, '-my-');
        Object.assign(mp4File, mp4FileUploaded.entry);

        const pptFileUploaded = await uploadActions.uploadFile(pptFile.location, pptFile.name, '-my-');
        Object.assign(pptFile, pptFileUploaded.entry);

        const unsupportedFileUploaded = await uploadActions.uploadFile(unsupportedFile.location, unsupportedFile.name, '-my-');
        Object.assign(unsupportedFile, unsupportedFileUploaded.entry);

        await loginPage.login(acsUser.username, acsUser.password);

        await contentServicesPage.goToDocumentList();
    });

    afterAll(async () => {
        await apiService.loginWithProfile('admin');
        await uploadActions.deleteFileOrFolder(pdfFile.getId());
        await uploadActions.deleteFileOrFolder(protectedFile.getId());
        await uploadActions.deleteFileOrFolder(docxFile.getId());
        await uploadActions.deleteFileOrFolder(jpgFile.getId());
        await uploadActions.deleteFileOrFolder(mp4File.getId());
        await uploadActions.deleteFileOrFolder(pptFile.getId());
        await uploadActions.deleteFileOrFolder(unsupportedFile.getId());
        await navigationBarPage.clickLogoutButton();
    });

    describe('Usual type files', () => {
        it('[C260038] Should display first page, toolbar and pagination when opening a .pdf file', async () => {
            await contentServicesPage.doubleClickRow(pdfFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(pdfFile.name);
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkFullScreenButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();
            await viewerPage.checkPreviousPageButtonIsDisplayed();
            await viewerPage.checkNextPageButtonIsDisplayed();
            await viewerPage.checkPageSelectorInputIsDisplayed('1');
            await viewerPage.checkPercentageIsDisplayed();
            await viewerPage.checkZoomInButtonIsDisplayed();
            await viewerPage.checkZoomOutButtonIsDisplayed();
            await viewerPage.checkScalePageButtonIsDisplayed();

            await viewerPage.clickCloseButton();
        });

        it('[C260040] Should be able to change pages and zoom when .pdf file is open', async () => {
            await contentServicesPage.doubleClickRow(pdfFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.clickNextPageButton();
            await viewerPage.checkFileContent('2', pdfFile.secondPageText);
            await viewerPage.checkPageSelectorInputIsDisplayed('2');

            await viewerPage.clickPreviousPageButton();
            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.checkPageSelectorInputIsDisplayed('1');

            await viewerPage.clearPageNumber();
            await viewerPage.checkPageSelectorInputIsDisplayed('');

            const initialWidth = await viewerPage.getCanvasWidth();
            const initialHeight = await viewerPage.getCanvasHeight();

            await viewerPage.clickZoomInButton();
            await expect(+(await viewerPage.getCanvasWidth())).toBeGreaterThan(+initialWidth);
            await expect(+(await viewerPage.getCanvasHeight())).toBeGreaterThan(+initialHeight);

            await viewerPage.clickActualSize();
            await expect(+(await viewerPage.getCanvasWidth())).toEqual(+initialWidth);
            await expect(+(await viewerPage.getCanvasHeight())).toEqual(+initialHeight);

            await viewerPage.clickZoomOutButton();
            await expect(+(await viewerPage.getCanvasWidth())).toBeLessThan(+initialWidth);
            await expect(+(await viewerPage.getCanvasHeight())).toBeLessThan(+initialHeight);

            await viewerPage.clickCloseButton();
        });

        it('[C260042] Should be able to download, open full-screen and Info container from the Viewer', async () => {
            await contentServicesPage.doubleClickRow(jpgFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkImgContainerIsDisplayed();

            await viewerPage.checkFullScreenButtonIsDisplayed();
            await viewerPage.clickFullScreenButton();

            await viewerPage.exitFullScreen();

            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.clickDownloadButton();

            await viewerPage.clickCloseButton();
        });

        it('[C260052] Should display image, toolbar and pagination when opening a .jpg file', async () => {
            await contentServicesPage.doubleClickRow(jpgFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkImgContainerIsDisplayed();

            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(jpgFile.name);
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkFullScreenButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();
            await viewerPage.checkZoomInButtonIsDisplayed();
            await viewerPage.checkZoomOutButtonIsDisplayed();
            await viewerPage.checkPercentageIsDisplayed();
            await viewerPage.checkScaleImgButtonIsDisplayed();

            await viewerPage.clickCloseButton();
        });

        it('[C260483] Should be able to zoom and rotate image when .jpg file is open', async () => {
            await contentServicesPage.doubleClickRow(jpgFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkPercentageIsDisplayed();

            let zoom = await viewerPage.getZoom();
            await viewerPage.clickZoomInButton();
            await viewerPage.checkZoomedIn(zoom);

            zoom = await viewerPage.getZoom();
            await viewerPage.clickZoomOutButton();
            await viewerPage.checkZoomedOut(zoom);

            await viewerPage.clickCloseButton();
        });

        it('[C279922] Should display first page, toolbar and pagination when opening a .ppt file', async () => {
            await contentServicesPage.doubleClickRow(pptFile.name);
            await viewerPage.waitTillContentLoaded();
            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkFileContent('1', pptFile.firstPageText);
            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(pptFile.name);
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();
            await viewerPage.checkPreviousPageButtonIsDisplayed();
            await viewerPage.checkNextPageButtonIsDisplayed();
            await viewerPage.checkPageSelectorInputIsDisplayed('1');
            await viewerPage.checkZoomInButtonIsDisplayed();
            await viewerPage.checkZoomOutButtonIsDisplayed();
            await viewerPage.checkScalePageButtonIsDisplayed();

            await viewerPage.clickCloseButton();
        });

        it('[C260053] Should display first page, toolbar and pagination when opening a .docx file', async () => {
            await contentServicesPage.doubleClickRow(docxFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkFileContent('1', docxFile.firstPageText);
            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(docxFile.name);
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();
            await viewerPage.checkPreviousPageButtonIsDisplayed();
            await viewerPage.checkNextPageButtonIsDisplayed();
            await viewerPage.checkPageSelectorInputIsDisplayed('1');
            await viewerPage.checkZoomInButtonIsDisplayed();
            await viewerPage.checkZoomOutButtonIsDisplayed();
            await viewerPage.checkScalePageButtonIsDisplayed();

            await viewerPage.clickCloseButton();
        });

        it('[C260054] Should display Preview could not be loaded and viewer toolbar when opening an unsupported file', async () => {
            await contentServicesPage.doubleClickRow(unsupportedFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(unsupportedFile.name);
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();

            await viewerPage.checkZoomInButtonIsNotDisplayed();
            await viewerPage.checkUnknownFormatIsDisplayed();
            await expect(await viewerPage.getUnknownFormatMessage()).toBe("Couldn't load preview. Unknown format.");

            await viewerPage.clickCloseButton();
        });

        it('[C260056] Should display video and viewer toolbar when opening a media file', async () => {
            await contentServicesPage.doubleClickRow(mp4File.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkMediaPlayerContainerIsDisplayed();
            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.checkFileThumbnailIsDisplayed();
            await viewerPage.checkFileNameIsDisplayed(mp4File.name);
            await viewerPage.checkDownloadButtonIsDisplayed();
            await viewerPage.checkInfoButtonIsDisplayed();

            await viewerPage.checkZoomInButtonIsNotDisplayed();

            await viewerPage.clickCloseButton();
        });

        it('[C261123] Should be able to preview all pages and navigate to a page when using thumbnails', async () => {
            await contentServicesPage.doubleClickRow(pdfFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();
            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.checkThumbnailsBtnIsDisplayed();
            await viewerPage.clickThumbnailsBtn();

            await viewerPage.checkThumbnailsContentIsDisplayed();
            await viewerPage.checkThumbnailsCloseIsDisplayed();
            await viewerPage.checkAllThumbnailsDisplayed(pdfFile.lastPageNumber);

            await viewerPage.clickSecondThumbnail();
            await viewerPage.checkFileContent('2', pdfFile.secondPageText);
            await viewerPage.checkCurrentThumbnailIsSelected();

            await viewerPage.checkPreviousPageButtonIsDisplayed();
            await viewerPage.clickPreviousPageButton();
            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.checkCurrentThumbnailIsSelected();

            await viewerPage.clickThumbnailsBtn();
            await viewerPage.checkThumbnailsContentIsNotDisplayed();
            await viewerPage.clickThumbnailsBtn();
            await viewerPage.checkThumbnailsCloseIsDisplayed();
            await viewerPage.clickThumbnailsClose();

            await viewerPage.clickCloseButton();
        });

        it('[C268105] Should display current thumbnail when getting to the page following the last visible thumbnail', async () => {
            await contentServicesPage.doubleClickRow(pdfFile.name);
            await viewerPage.waitTillContentLoaded();

            await viewerPage.checkZoomInButtonIsDisplayed();

            await viewerPage.checkFileContent('1', pdfFile.firstPageText);
            await viewerPage.checkThumbnailsBtnIsDisplayed();
            await viewerPage.clickThumbnailsBtn();
            await viewerPage.clickLastThumbnailDisplayed();
            await viewerPage.checkCurrentThumbnailIsSelected();

            await viewerPage.checkNextPageButtonIsDisplayed();
            await viewerPage.clickNextPageButton();
            await viewerPage.checkCurrentThumbnailIsSelected();

            await viewerPage.clickCloseButton();
        });

        it('[C269109] Should not be able to open thumbnail panel before the pdf is loaded', async () => {
            const fileView = element.all(by.css(`#document-list-container div[data-automation-id="${pdfFile.name}"]`)).first();
            await BrowserActions.click(fileView);
            await browser.actions().sendKeys(protractor.Key.ENTER).perform();

            await viewerPage.checkThumbnailsBtnIsDisabled();

            await viewerPage.checkCloseButtonIsDisplayed();
            await viewerPage.clickCloseButton();
        });
    });

    describe('Viewer - version update with unsupported file', () => {
        it('[C587084] Should display unknown format the preview for an unsupported file', async () => {
            await changeFileNameInViewer(unsupportedFile.name, 'generic-unsupported-file-1st.3DS');
            await uploadNewVersion(jpgFile.name, unsupportedFileByLocation.location);
            await previewUnsupportedFile(unsupportedFileByLocation.name);

            await changeFileNameInViewer(unsupportedFileByLocation.name, 'generic-unsupported-file-2nd.3DS');
            await uploadNewVersion(pdfFile.name, unsupportedFileByLocation.location);
            await previewUnsupportedFile(unsupportedFileByLocation.name);

            await changeFileNameInViewer(unsupportedFileByLocation.name, 'generic-unsupported-file-3rd.3DS');
            await uploadNewVersion(mp4File.name, unsupportedFileByLocation.location);
            await previewUnsupportedFile(unsupportedFileByLocation.name);
        });
    });

    async function uploadNewVersion(originalFileName: string, newVersionLocation: string): Promise<void> {
        await contentServicesPage.doubleClickRow(originalFileName);
        await viewerPage.waitTillContentLoaded();

        await viewerPage.clickCloseButton();
        await contentServicesPage.versionManagerContent(originalFileName);
        await versionManagePage.showNewVersionButton.click();
        await versionManagePage.uploadNewVersionFile(newVersionLocation);
        await versionManagePage.closeActionsMenu();
        await versionManagePage.closeVersionDialog();
        await browser.refresh();
    }

    async function previewUnsupportedFile(unsupportedFileName: string): Promise<void> {
        await contentServicesPage.doubleClickRow(unsupportedFileName);
        await viewerPage.waitTillContentLoaded();
        await viewerPage.checkUnknownFormatIsDisplayed();
        await expect(await viewerPage.getUnknownFormatMessage()).toBe("Couldn't load preview. Unknown format.");
        await viewerPage.clickCloseButton();
    }

    async function changeFileNameInViewer(fileName: string, newName: string): Promise<void> {
        await contentServicesPage.doubleClickRow(fileName);
        await viewerPage.waitTillContentLoaded();

        await viewerPage.clickInfoButton();
        await viewerPage.checkInfoSideBarIsDisplayed();
        await viewerPage.clickOnTab('Properties');
        await viewerPage.checkTabIsActive('Properties');
        await metadataViewPage.clickEditIconGeneral();
        await metadataViewPage.enterPropertyText('properties.cm:name', newName);
        await metadataViewPage.clickSaveGeneralMetadata();
        await viewerPage.clickCloseButton();
    }
});
