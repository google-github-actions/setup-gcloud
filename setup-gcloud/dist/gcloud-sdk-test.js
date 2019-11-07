"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as rest from 'typed-rest-client/RestClient';
//import request from 'request-promise-native';
const request = require('request-promise-native');
const http = require('http');
function queryGcloudSDKRelease(osPlat, osArch, versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        let objectName;
        switch (osPlat) {
            case 'linux':
                objectName = `google-cloud-sdk-${versionSpec}-linux-${osArch}.tar.gz`;
                break;
            case 'darwin':
                objectName = `google-cloud-sdk-${versionSpec}-darwin-${osArch}.tar.gz`;
                break;
            case 'win32':
                objectName = `google-cloud-sdk-${versionSpec}-windows-${osArch}.zip`;
                break;
            default:
                throw new Error(`Unexpected OS '${osPlat}'`);
        }
        let dataUrl = encodeURI(`https://www.googleapis.com/storage/v1/b/cloud-sdk-release/o?prefix='${objectName}'`);
        console.log(`\n!!dataUrl: ${dataUrl}\n`);
        //let response : rest.IRestResponse<IStorageObjects> = await client.get<IStorageObjects>(dataUrl);
        let response = yield request({
            method: 'GET',
            uri: dataUrl,
            headers: { "Content-Type": " application/json" }
        });
        console.log(`\n!!response: ${response}\n`);
        // console.log(`\n!!response.statusCode: ${response.statusCode}\n`);
        // console.log(`\n!!response.result: ${response.result}\n`);
        // console.log("\n!!response.result.keys:\n");
        // Object.keys(response.result!).forEach(key => console.log(`${key}\n`));
        //console.log(`\n!!response.result.kind: ${response.result!.kind}\n`);
        //console.log("\n!!response.result.keys: " + Object.keys(response.result) + "\n");
        return null;
        // let listReleasesResponse: IStorageObjectListReponse | null =
        //     (await rest.get<IStorageObjectListReponse>(dataUrl)).result || null;
        // // get the latest generation that matches the version spec
        // if (!listReleasesResponse) {
        //     throw new Error('Unable to retreieve cloud sdk version list');
        // }
        // console.log("\n!!listReleasesResponse: " + typeof listReleasesResponse + "\n");
        // console.log("\n!!listReleasesResponse.keys: " + Object.keys(listReleasesResponse) + "\n");
        // console.log(`\n!!listReleasesResponse.kind: ${listReleasesResponse.kind}\n`);
        // let release: IStorageObject | null = listReleasesResponse.items.sort((a,b) => {
        //     if (a.generation > b.generation) {
        //         return 1;
        //     }
        //     return -1;
        // })[0];
        // if (release) {
        //     return { name: release.name, url: release.mediaLink, version: versionSpec };
        // }
        // return null;
    });
}
exports.queryGcloudSDKRelease = queryGcloudSDKRelease;
