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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A collection of utility functions for testing.
 */
const path_1 = __importDefault(require("path"));
/**
 * Sets up a temporary directory for testing within the `__tests_/runner`
 * directory.
 *
 * @param leafName The leaf directory name.
 * @param envName If specified, the name of the environment variable the
 * temporary directory path will be saved to.
 */
function setupTempDir(leafName, envName) {
    const tempDirPath = path_1.default.join(__dirname, 'runner', Math.random()
        .toString(36)
        .substring(8), leafName);
    if (envName) {
        process.env[envName] = tempDirPath;
    }
    return tempDirPath;
}
exports.setupTempDir = setupTempDir;
/**
 * The version of the gcloud SDK being tested against.
 */
exports.TEST_SDK_VERSION = '270.0.0';
