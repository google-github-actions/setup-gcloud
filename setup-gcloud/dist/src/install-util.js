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
/**
 * Contains installation utility functions.
 */
const toolCache = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const path_1 = __importDefault(require("path"));
const shell = __importStar(require("shelljs"));
/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @param gcloudExtPath The extraction path for the gcloud SDK.
 * @returns The path of the installed tool.
 */
function installGcloudSDK(version, gcloudExtPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolRoot = path_1.default.join(gcloudExtPath, 'google-cloud-sdk');
        let toolPath = yield toolCache.cacheDir(toolRoot, 'gcloud', version);
        toolPath = path_1.default.join(toolPath, 'bin');
        const shellResult = shell.chmod('+x', path_1.default.join(toolPath, 'gcloud'));
        if (shellResult.code != 0) {
            throw new Error(`Failed to set execute permissions on gcloud binary, error: ${shellResult.stderr}`);
        }
        core.addPath(toolPath);
        return toolPath;
    });
}
exports.installGcloudSDK = installGcloudSDK;
