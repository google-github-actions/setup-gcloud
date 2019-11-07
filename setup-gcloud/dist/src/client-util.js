"use strict";
/*
 * Copyright 2019 Google LLC
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains REST client utility functions.
 */
const rest = __importStar(require("typed-rest-client/RestClient"));
/**
 * Queries for a gcloud SDK release.
 *
 * @param os The OS of the release.
 * @param arch The architecutre of the release
 * @param version The version of the release.
 * @returns The matching release data or else null if not found.
 */
function queryGcloudSDKRelease(os, arch, version) {
    return __awaiter(this, void 0, void 0, function* () {
        // massage the arch to match gcloud sdk conventions
        if (arch == 'x64') {
            arch = 'x86_64';
        }
        const client = getClient();
        const storageObjects = (yield client.get(formatReleaseURL(os, arch, version))).result;
        // If no response was returned this indicates an error.
        if (!storageObjects) {
            throw new Error('Unable to retreieve cloud sdk version list');
        }
        // If an empty response was returned, this indicates no matches found.
        if (!storageObjects.items) {
            return null;
        }
        // Get the latest generation that matches the version spec.
        const release = storageObjects.items.sort((a, b) => {
            if (a.generation > b.generation) {
                return 1;
            }
            return -1;
        })[0];
        if (release) {
            return {
                name: release.name,
                url: release.mediaLink,
                version: version
            };
        }
        return null;
    });
}
exports.queryGcloudSDKRelease = queryGcloudSDKRelease;
function formatReleaseURL(os, arch, version) {
    let objectName;
    switch (os) {
        case 'linux':
            objectName = `google-cloud-sdk-${version}-linux-${arch}.tar.gz`;
            break;
        case 'darwin':
            objectName = `google-cloud-sdk-${version}-darwin-${arch}.tar.gz`;
            break;
        case 'win32':
            objectName = `google-cloud-sdk-${version}-windows-${arch}.zip`;
            break;
        default:
            throw new Error(`Unexpected OS '${os}'`);
    }
    return encodeURI(`https://www.googleapis.com/storage/v1/b/cloud-sdk-release/o?prefix=${objectName}`);
}
function getClient() {
    return new rest.RestClient('github-actions-setup-gcloud');
}
