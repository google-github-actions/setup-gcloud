import {
  Storage,
  UploadResponse,
  DeleteFileResponse,
  File
} from '@google-cloud/storage'
import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

const storage = new Storage()

/**
 * Uploads a file to a bucket
 * based on https://github.com/googleapis/nodejs-storage/blob/master/samples/uploadFile.js
 * @param bucketName The name of the bucket
 * @param filename The file path
 * @param destination The destination prefix
 */
export async function uploadFile(
  bucketName: string,
  filename: string,
  destination?: string
): Promise<UploadResponse | Error> {
  interface UploadOptions {
    gzip: boolean
    destination?: string
  }
  const options: UploadOptions = {gzip: true}
  if (destination) {
    options.destination = `${destination}${filename.slice(
      filename.lastIndexOf('/') + 1
    )}`
  }
  try {
    const uploadedFile = await storage
      .bucket(bucketName)
      .upload(filename, options)
    console.log(`${filename} uploaded to ${bucketName}.`)
    return uploadedFile
  } catch (err) {
    return err
  }
}

/**
 * List all files in a bucket, filtered by prefix
 * based on https://github.com/googleapis/nodejs-storage/blob/master/samples/listFilesByPrefix.js
 * @param bucketName The name of the bucket
 * @param prefix The prefix to filter by
 * @param delimiter Optional delimiter
 */
export async function listFilesByPrefix(
  bucketName: string,
  prefix: string,
  delimiter?: string
): Promise<File[]> {
  //interface for listing options
  interface ListOptions {
    prefix: string
    delimiter?: string
  }
  const options: ListOptions = {prefix}

  if (delimiter) {
    options.delimiter = delimiter
  }
  // Lists files in the bucket, filtered by a prefix
  const [files] = await storage.bucket(bucketName).getFiles(options)
  return files
}

/**
 * Deletes a file in a bucket
 * based on https://github.com/googleapis/nodejs-storage/blob/master/samples/deleteFile.js
 * @param bucketName The name of the bucket
 * @param filename The name of the name of the file to be deleted
 */
export async function deleteFile(
  bucketName: string,
  filename: string
): Promise<{status: DeleteFileResponse}> {
  try {
    const deletedFile = await storage
      .bucket(bucketName)
      .file(filename)
      .delete()
    console.log(`gs://${bucketName}/${filename} deleted.`)
    return {status: deletedFile}
  } catch (err) {
    return {status: err}
  }
}

/**
 * Uploads a specified directory to a GCS bucket
 * based on https://github.com/googleapis/nodejs-storage/blob/master/samples/uploadDirectory.js
 * @param bucketName The name of the bucket
 * @param directoryPath The path of the directory to upload
 * @param objectKeyPrefix Optional Prefix for in the GCS bucket
 * @param clearExistingFilesFirst Clean files in the prefix before uploading
 */
export async function uploadDirectory(
  bucketName: string,
  directoryPath: string,
  objectKeyPrefix: string = '',
  clearExistingFilesFirst: boolean = false
): Promise<{fileName: string; status: UploadResponse | Error}[] | undefined> {
  // to store list of all files

  const fileList: string[] = []
  // get the list of files from the specified directory
  let dirCtr = 1
  let itemCtr = 0
  const pathDirName = path.dirname(directoryPath)

  /**
   * Uploads a list of files to GCS
   */
  async function onComplete(): Promise<
    {fileName: string; status: UploadResponse | Error}[]
  > {
    // if clearExistingFilesFirst, clear all files inside objectKeyPrefix
    // if bucket contains /a/1.txt and /a/b/2.txt and prefix is /a
    // /a/1.txt and /a/b/2.txt will both be cleared
    if (clearExistingFilesFirst) {
      try {
        await listFilesByPrefix(bucketName, objectKeyPrefix).then(files => {
          files.map((file: {name: string}) => {
            deleteFile(bucketName, file.name)
          })
        })
      } catch (err) {
        core.setFailed(`Action failed with error ${err}`)
        //console.log(err)
      }
    }
    const resp = await Promise.all(
      fileList.map(async filePath => {
        let destination = `${objectKeyPrefix}${path.relative(
          pathDirName,
          filePath
        )}`
        // If running on Windows
        if (process.platform === 'win32') {
          destination = destination.replace(/\\/g, '/')
        }
        try {
          const uploadResp = await storage
            .bucket(bucketName)
            .upload(filePath, {destination})
          return {fileName: destination, status: uploadResp[0]}
        } catch (err) {
          return {fileName: destination, status: err}
        }
      })
    )
    //print out file status for each file upload
    resp.map(file => {
      if (file.status instanceof Error) {
        console.log(`${file.fileName} failed upload to ${bucketName}.`)
      } else {
        console.log(`${file.fileName} uploaded to ${bucketName} successfully.`)
      }
    })
    //print out total successful file uploads
    const successfulUploads =
      fileList.length - resp.filter(r => r.status instanceof Error).length
    console.log(
      `${successfulUploads} files uploaded to ${bucketName} successfully.`
    )
    return resp
  }

  /**
   * Directory walk helper
   * @param directory The path of the directory to traverse
   */
  async function getAndUploadFiles(
    directory: string
  ): Promise<{fileName: string; status: UploadResponse | Error}[] | undefined> {
    const items = await fs.promises.readdir(directory)
    dirCtr--
    itemCtr += items.length
    for (const item of items) {
      const fullPath = path.join(directory, item)
      const stat = await fs.promises.stat(fullPath)
      itemCtr--
      if (stat.isFile()) {
        fileList.push(fullPath)
      } else if (stat.isDirectory()) {
        dirCtr++
        return getAndUploadFiles(fullPath)
      }
      if (dirCtr === 0 && itemCtr === 0) {
        return await onComplete()
      }
    }
  }

  return await getAndUploadFiles(directoryPath)
}
