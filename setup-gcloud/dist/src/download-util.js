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
 * Contains download utility functions.
 */
const toolCache = __importStar(require("@actions/tool-cache"));
/**
 * Downloads and extracts the tool at the specified URL.
 *
 * @url The URL of the tool to be downloaded.
 * @returns The path to the locally extracted tool.
 */
function downloadAndExtractTool(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadPath = yield toolCache.downloadTool(url);
        let extractedPath;
        if (url.indexOf('.zip') != -1) {
            extractedPath = yield toolCache.extractZip(downloadPath);
        }
        else if (url.indexOf('.tar.gz') != -1) {
            extractedPath = yield toolCache.extractTar(downloadPath);
        }
        else if (url.indexOf('.7z') != -1) {
            extractedPath = yield toolCache.extract7z(downloadPath);
        }
        else {
            throw new Error(`Unexpected download archive type, downloadPath: ${downloadPath}`);
        }
        return extractedPath;
    });
}
exports.downloadAndExtractTool = downloadAndExtractTool;
