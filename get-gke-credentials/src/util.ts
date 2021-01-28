import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Write content to a file
 *
 * @param fileContent File content to write.
 * @returns file path.
 */
export async function writeFile(fileContent: string): Promise<string> {
  const workspace = process.env.GITHUB_WORKSPACE;
  if (!workspace) {
    throw new Error('Missing GITHUB_WORKSPACE!');
  }
  const kubeConfigPath = path.join(workspace, uuidv4());
  try {
    await fs.writeFileSync(kubeConfigPath, fileContent);
    return kubeConfigPath;
  } catch (err) {
    throw new Error(`Unable to write kubeconfig to file: ${kubeConfigPath}`);
  }
}
