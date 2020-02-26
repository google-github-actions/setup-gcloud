import * as gcs from '../src/gcs';
import { UploadResponse } from '@google-cloud/storage';

/*
 * Test upload a single file to GCS
 */
test('upload file to gcs without prefix', async () => {
  const uploadedFile = await gcs.uploadFile(
    'gh-test-tf-1',
    `${__dirname}/testdata/test1.txt`,
  );
  expect(!(uploadedFile instanceof Error));
  expect((uploadedFile as UploadResponse)[0].name).toEqual('test1.txt');
});
/*
 * Test upload a single file with prefix to GCS
 */
test('upload file to gcs with prefix', async () => {
  const uploadedFile = await gcs.uploadFile(
    'gh-test-tf-1',
    `${__dirname}/testdata/test1.txt`,
    'testPrefix/',
  );
  expect(!(uploadedFile instanceof Error));
  expect((uploadedFile as UploadResponse)[0].name).toEqual(
    'testPrefix/test1.txt',
  );
});
/*
 * Test upload a directory to GCS
 */
test('upload dir to gcs without prefix', async () => {
  const uploadedDirectory = await gcs.uploadDirectory(
    'gh-test-tf-1',
    `${__dirname}/testdata`,
  );
  //we expected two uploaded files
  expect(uploadedDirectory!.length).toEqual(2);
  expect(
    uploadedDirectory!.map((file: { fileName: string }) => file.fileName),
  ).toEqual(['testdata/test1.txt', 'testdata/test2.txt']);
});
/*
 * Test upload a directory with prefix to GCS
 */
test('upload dir to gcs with prefix', async () => {
  const uploadedDirectory = await gcs.uploadDirectory(
    'gh-test-tf-1',
    `${__dirname}/testdata`,
    'testPrefixDir/',
  );
  //we expected two uploaded files
  expect(uploadedDirectory!.length).toEqual(2);
  expect(
    uploadedDirectory!.map((file: { fileName: string }) => file.fileName),
  ).toEqual([
    'testPrefixDir/testdata/test1.txt',
    'testPrefixDir/testdata/test2.txt',
  ]);
});
