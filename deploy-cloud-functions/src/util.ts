import * as fs from 'fs';
import { Gaxios } from 'gaxios';
import * as Archiver from 'archiver';

/**
 * Zip a directory.
 *
 * @param dirPath Directory to zip.
 * @returns filepath of the created zip file.
 */
export async function zipDir(dirPath: string): Promise<string> {
  // Check dirpath
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Unable to find ${dirPath}`);
  }
  // Create output file stream
  const outputPath = `./cfsrc-${Math.floor(Math.random() * 100000)}.zip`;
  const output = fs.createWriteStream(outputPath);
  // Init archive
  const archive = Archiver.create('zip');
  archive.pipe(output);
  // Add dir to root of archive
  archive.directory(dirPath, false);
  // Finish writing files
  archive.finalize();
  return outputPath;
}

/**
 * Deletes a zip file from disk.
 *
 * @param filePath File to delete.
 * @returns Boolean success/failure.
 */
export async function deleteZipFile(filePath: string): Promise<boolean> {
  // check dirpath
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unable to find ${filePath}`);
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return false;
    }
  });
  return true;
}

/**
 * Upload a file to a Signed URL.
 *
 * @param uploadUrl Signed URL.
 * @param zipPath File to upload.
 * @returns uploaded URL.
 */
export async function uploadSource(
  uploadUrl: string,
  zipPath: string,
): Promise<string> {
  const zipFile = fs.createReadStream(zipPath);
  const client = new Gaxios();
  client.request({
    method: 'PUT',
    body: zipFile,
    url: uploadUrl,
    headers: {
      'content-type': 'application/zip',
      'x-goog-content-length-range': '0,104857600',
    },
  });
  return uploadUrl;
}
