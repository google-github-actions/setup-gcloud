import * as core from '@actions/core'
import * as gcs from './gcs'
async function run(): Promise<void> {
  try {
    const folderToUpload = core.getInput('folder-to-upload')
    const fileToUpload = core.getInput('file-to-upload')
    const bucketName = core.getInput('bucket-name')
    const objectKeyPrefix = core.getInput('object-key-prefix')
    const clearExistingFilesFirst: boolean =
      core.getInput('clear-existing-files-first').toLowerCase() !== 'false'

    if (folderToUpload && !fileToUpload) {
      const uploadedFiles = await gcs.uploadDirectory(
        bucketName,
        folderToUpload,
        objectKeyPrefix,
        clearExistingFilesFirst
      )

      if (uploadedFiles) {
        core.setOutput(
          'uploadedSuccessFiles',
          uploadedFiles
            .filter(file => !(file.status instanceof Error))
            .map(file => file.fileName)
            .toString()
        )
        if (
          uploadedFiles.filter(file => file.status instanceof Error).length > 0
        ) {
          core.setOutput(
            'uploadFailedFiles',
            uploadedFiles
              .filter(file => file.status instanceof Error)
              .map(file => file.fileName)
              .toString()
          )
        }
      }
    } else if (fileToUpload && !folderToUpload) {
      const uploadedFile = await gcs.uploadFile(
        bucketName,
        fileToUpload,
        objectKeyPrefix
      )
      if (uploadedFile instanceof Error) {
        core.setOutput('uploadFailedFiles', fileToUpload)
      } else {
        core.setOutput('uploadedSuccessFile', uploadedFile[0].name)
      }
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
