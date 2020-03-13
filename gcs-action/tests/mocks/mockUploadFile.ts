import { UploadResponse, File, Bucket, Storage } from '@google-cloud/storage';
import * as path from 'path';
export async function mockUploadFile(
  bucketName: string,
  filename: string,
  destination?: string,
): Promise<UploadResponse> {
  let fileName: string = path.posix.basename(filename);
  if (destination) {
    // if obj prefix is set, then extract filename and append to prefix
    fileName = `${destination}/${path.posix.basename(filename)}`;
  }
  const file: File = new File(new Bucket(new Storage(), 'foo'), fileName);

  return Promise.resolve([file, { name: fileName }]);
}
