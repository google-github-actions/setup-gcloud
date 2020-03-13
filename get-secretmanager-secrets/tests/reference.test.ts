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

import { Reference } from '../src/reference';

describe('Reference', function() {
  it('parses a full ref', function() {
    const ref = new Reference('out:projects/fruits/secrets/apple/versions/123');
    const link = ref.selfLink();
    expect(link).equal('projects/fruits/secrets/apple/versions/123');
  });

  it('parses a full ref sans version', function() {
    const ref = new Reference('out:projects/fruits/secrets/apple');
    const link = ref.selfLink();
    expect(link).equal('projects/fruits/secrets/apple/versions/latest');
  });

  it('parses a short ref', function() {
    const ref = new Reference('out:fruits/apple/123');
    const link = ref.selfLink();
    expect(link).equal('projects/fruits/secrets/apple/versions/123');
  });

  it('parses a short ref sans version', function() {
    const ref = new Reference('out:fruits/apple');
    const link = ref.selfLink();
    expect(link).equal('projects/fruits/secrets/apple/versions/latest');
  });

  it('errors on invalid format', function() {
    const fn = (): Reference => {
      return new Reference(
        'out:projects/fruits/secrets/apple/versions/123/subversions/5',
      );
    };
    expect(fn).to.throw(TypeError);
  });

  it('errors on missing output', function() {
    const fn = (): Reference => {
      return new Reference('fruits/apple/123');
    };
    expect(fn).to.throw(TypeError);
  });
});
