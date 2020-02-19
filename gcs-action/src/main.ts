import * as core from '@actions/core'
import * as gcs from './gcs'
import * as tmp from 'tmp'
import {Base64} from 'js-base64'
import {promises as fs} from 'fs'
async function run(): Promise<void> {
  try {
    //setup GOOGLE_APPLICATION_CREDENTIALS
    //tmp workaround until PR #30 lands

    tmp.setGracefulCleanup()

    const serviceAccountKey = core.getInput('service_account_key')
    const folderToUpload = core.getInput('folder-to-upload')
    const fileToUpload = core.getInput('file-to-upload')
    const bucketName = core.getInput('bucket-name')
    const objectKeyPrefix = core.getInput('object-key-prefix')
    const clearExistingFilesFirst: boolean =
      core.getInput('clear-existing-files-first').toLowerCase() !== 'false'

    const tmpKeyFilePath = await new Promise<string>((resolve, reject) => {
      tmp.file((err, path) => {
        if (err) {
          reject(err)
        }
        resolve(path)
      })
    })
    await fs.writeFile(tmpKeyFilePath, Base64.decode(serviceAccountKey))
    process.env['GOOGLE_APPLICATION_CREDENTIALS'] = tmpKeyFilePath

    if (folderToUpload && !fileToUpload) {
      await gcs.uploadDirectory(
        bucketName,
        folderToUpload,
        objectKeyPrefix,
        clearExistingFilesFirst
      )
    } else if (fileToUpload && !folderToUpload) {
      await gcs.uploadFile(bucketName, fileToUpload, objectKeyPrefix)
    } else {
      throw new Error(
        'Please configure either file-to-upload or folder-to-upload'
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
