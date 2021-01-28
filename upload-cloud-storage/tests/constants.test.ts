/*
 * Copyright 2020 Google LLC
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

import { Storage, Bucket, File } from '@google-cloud/storage';

/**
 * Define constants used in the unit tests below.
 */
export const EXAMPLE_BUCKET = 'test-bucket';
export const EXAMPLE_FILE = './tests/testdata/test1.txt';
export const EXAMPLE_DIR = './tests/testdata';
export const EXAMPLE_PREFIX = 'testprefix';
export const FAKE_METADATA = { name: 'foo' };
export const FAKE_FILE: File = new File(
  new Bucket(new Storage(), 'foo'),
  'foo',
);
export const FILES_IN_DIR = [
  'tests/testdata/nested1/nested2/test3.txt',
  'tests/testdata/nested1/test1.txt',
  'tests/testdata/test1.txt',
  'tests/testdata/test2.txt',
  'tests/testdata/testfile',
  'tests/testdata/🚀',
];
