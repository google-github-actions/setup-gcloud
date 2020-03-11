/**
 * Creates the gcloud SDK release URL for the specified arguments, verifying
 * its existence.
 *
 * @param os The OS of the requested release.
 * @param arch The system architecture of the requested release.
 * @param version The version of the requested release.
 * @returns The verified gcloud SDK release URL.
 */
export declare function getReleaseURL(os: string, arch: string, version: string): Promise<string>;
