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

import { expect } from 'chai';
import 'mocha';
import { getFiles } from '../src/util';
import { FILES_IN_DIR } from './constants.test';

/**
 * Unit Test getFiles method in utils.
 */
describe('Unit Test getFiles', function() {
  it('gets single file in a directory', async function() {
    const singleFileDir = 'tests/testdata/nested1/nested2';
    const singleFileName = 'test3.txt';
    const files = await getFiles(singleFileDir);
    expect(files.length).eq(1);
    expect(files[0]).eq(`${singleFileDir}/${singleFileName}`);
  });
  it('recursively walks directory', async function() {
    const multiFileDir = 'tests/testdata/';
    const files = await getFiles(multiFileDir);
    expect(files.length).eq(FILES_IN_DIR.length);
    expect(files).to.have.members(FILES_IN_DIR);
  });
});
