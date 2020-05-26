/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import { get } from 'lodash';
import 'mocha';

import { Service, EnvVar } from '../src/service';

const image = 'gcr.io/projectId/image';
const name = 'serviceName';
const yamlImage = 'gcr.io/cloudrun/hello';
const yamlName = 'hello';

describe('Service', function() {
  it('creates a service', function() {
    const service = new Service({ image, name });
    expect(service.request.metadata!.name).equal(name);
    expect(service.request).to.have.property('kind');
  });

  it('parses one env vars', function() {
    const envVars = 'KEY1=VALUE1';
    const service = new Service({ image, name, envVars });
    const containers = get(service, 'request.spec.template.spec.containers');
    const actual = containers[0]?.env[0];
    const expected: EnvVar = {
      name: 'KEY1',
      value: 'VALUE1',
    };
    expect(actual.name).equal(expected.name);
  });

  it('parses three env vars', function() {
    const envVars = 'KEY1=VALUE1,KEY2=VALUE2,KEY3=VALUE3';
    const service = new Service({ image, name, envVars });
    const containers = get(service, 'request.spec.template.spec.containers');
    const actual = containers[0]?.env;
    expect(actual).to.have.lengthOf(3);
  });

  it('throws error with bad env vars', function() {
    const envVars = 'KEY1,VALUE1';
    expect(function() {
      const service = new Service({ image, name, envVars });
    }).to.throw(
      'Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received KEY1',
    );
  });

  it('parses yaml', function() {
    const yaml = './tests/service.basic.yaml';
    const service = new Service({ image, name, yaml });
    expect(service.request.metadata!.name).equal(name);
    const containers = get(service, 'request.spec.template.spec.containers');
    expect(containers[0]?.image).equal(image);
  });

  it('creates service from yaml', function() {
    const yaml = './tests/service.basic.yaml';
    const service = new Service({ yaml });
    expect(service.request.metadata!.name).equal('test-basic-yaml');
    const containers = get(service, 'request.spec.template.spec.containers');
    expect(containers[0]!.image).equal(yamlImage);
    expect(service.request).to.have.property('kind');
  });

  it('parses yaml and env vars', function() {
    const yaml = './tests/service.basic.yaml';
    const envVars = 'KEY1=VALUE1';
    const service = new Service({ yaml, envVars });
    const containers = get(service, 'request.spec.template.spec.containers');
    expect(containers).to.be.length(1);
    expect(containers[0].image).to.equal(yamlImage);
    expect(containers[0].env).to.equal({'KEY1': 'VALUE1'})
  });

  it('sets args from yaml', function() {
    const yaml = './tests/service.full.yaml';
    const service = new Service({ yaml });
    expect(service.request.metadata!.name!).equal('test-full-yaml');
    const containers = get(service, 'request.spec.template.spec.containers');
    expect(containers[0]?.resources?.limits?.cpu).equal('2');
    expect(containers[0]?.resources?.limits?.memory).equal('1Gi');
    const concurrency = get(service, 'request.spec.template.spec.containerConcurrency');
    expect(concurrency).equal(20);
  });
});
