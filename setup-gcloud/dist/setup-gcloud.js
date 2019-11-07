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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = __importDefault(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
const js_base64_1 = require("js-base64");
const fs_1 = require("fs");
const tmp = __importStar(require("tmp"));
const os = __importStar(require("os"));
const clientUtil = __importStar(require("./client-util"));
const downloadUtil = __importStar(require("./download-util"));
const installUtil = __importStar(require("./install-util"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tmp.setGracefulCleanup();
            const version = core.getInput('version');
            if (!version) {
                throw new Error('Missing required parameter: `version`');
            }
            const serviceAccountEmail = core.getInput('service_account_email');
            if (!serviceAccountEmail) {
                throw new Error('Missing required input: `service_account_email`');
            }
            const serviceAccountKey = core.getInput('service_account_key');
            if (!serviceAccountKey) {
                throw new Error('Missing required input: `service_account_key`');
            }
            // install the gcloud is not already present
            let toolPath = toolCache.find('gcloud', version);
            if (!toolPath) {
                installGcloudSDK(version);
            }
            // write the service account key to a temporary file
            const tmpKeyFilePath = yield new Promise((resolve, reject) => {
                tmp.file((err, path, fd, cleanupCallback) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(path);
                });
            });
            yield fs_1.promises.writeFile(tmpKeyFilePath, js_base64_1.Base64.decode(serviceAccountKey));
            // authenticate as the specified service account
            yield exec_1.default.exec(`gcloud auth activate-service-account ${serviceAccountEmail} --key-file=${tmpKeyFilePath}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function installGcloudSDK(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // retreive the release corresponding to the specified version and the current env
        const osPlat = os.platform();
        const osArch = os.arch();
        const release = yield clientUtil.queryGcloudSDKRelease(osPlat, osArch, version);
        if (!release) {
            throw new Error(`Failed to find release, os: ${osPlat} arch: ${osArch} version: ${version}`);
        }
        // download and extract the release
        const extPath = yield downloadUtil.downloadAndExtractTool(release.url);
        if (!extPath) {
            throw new Error(`Failed to download release, url: ${release.url}`);
        }
        // install the downloaded release into the github action env
        yield installUtil.installGcloudSDK(version, extPath);
    });
}
run();
