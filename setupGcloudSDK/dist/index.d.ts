import { getLatestGcloudSDKVersion } from './version-util';
export { getLatestGcloudSDKVersion };
/**
 * Format of a GCloud configuration when using the GCloud CLI like this:
 * `gcloud config configurations describe $CONFIGURATION_NAME --format=json`
 */
export declare type GcloudJsonConfiguration = {
    is_active: boolean;
    name: string;
    properties: {
        core: {
            project: string;
        };
    };
};
/**
 * Checks if gcloud is installed.
 *
 * @param version (Optional) Cloud SDK version.
 * @return true if gcloud is found in toolpath.
 */
export declare function isInstalled(version?: string): boolean;
/**
 * Returns the correct gcloud command for OS.
 *
 * @returns gcloud command.
 */
export declare function getToolCommand(): string;
/**
 * Checks if the project Id is set in the gcloud config.
 *
 * @returns true is project Id is set.
 */
export declare function isProjectIdSet(): Promise<boolean>;
/**
 * Checks if gcloud is authenticated.
 *
 * @returns true is gcloud is authenticated.
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @returns The path of the installed tool.
 */
export declare function installGcloudSDK(version: string): Promise<string>;
/**
 * Parses the service account string into JSON.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns ServiceAccountKey as an object.
 */
export declare function parseServiceAccountKey(serviceAccountKey: string): ServiceAccountKey;
/**
 * Fetches information about a configuration with the given name.
 * @param name Name of the configuration to be fetched.
 * @return undefined if a configuration with the given name does not (yet?) exist.
 */
export declare function getConfiguration(name: string): Promise<GcloudJsonConfiguration | undefined>;
/**
 * Checks if the configuration with the given name has been defined already.
 * @param name Name of the configuration to be checked for existence.
 * @return true if the configuration has already been defined.
 */
export declare function hasConfiguration(name: string): Promise<boolean>;
/**
 * Creates a new configuration with the given name.
 * @param name Name of the configuration to be created.
 * @param activate true if the configuration shall be activated after creation, false otherwise.
 */
export declare function createConfiguration(name: string, activate?: boolean): Promise<void>;
/**
 * Activates the configuration with the given name.
 * If the configuration does not (yet) exist, it can directly be created.
 * @param name Name of the configuration to be activated.
 * @param create true if the configuration shall be created if it does not yet exist prior to activating it.
 */
export declare function activateConfiguration(name: string, create?: boolean): Promise<void>;
/**
 * Authenticates the gcloud tool using a service account key.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns exit code.
 */
export declare function authenticateGcloudSDK(serviceAccountKey: string): Promise<number>;
/**
 * Sets the GCP Project Id in the gcloud config.
 *
 * @param projectId The ID of the default project used in the current configuration.
 * @returns exit code.
 */
export declare function setProject(projectId: string): Promise<number>;
/**
 * Sets the GCP Project Id in the gcloud config.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns project ID.
 */
export declare function setProjectWithKey(serviceAccountKey: string): Promise<string>;
interface ServiceAccountKey {
    type: string;
    project_id: string;
    project_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}
