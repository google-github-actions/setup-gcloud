/**
 * Creates an overridden runner cache and tool path. This is slightly
 * complicated by the fact that the runner initializes its cache path exactly
 * once at startup, so this must be imported and called BEFORE the toolcache is
 * used.
 */
export declare class TestToolCache {
    private static paths;
    /**
     * Creates temporary directories for the runner cache and temp, and configures
     * the Action's runner to use said directories.
     *
     * @returns two strings - first is overridden toolsPath, second is tempPath.
     */
    static override(): [string, string];
    private static randomStr;
}
/**
 * The version of the gcloud SDK being tested against.
 */
export declare const TEST_SDK_VERSIONS: string[];
export declare const TEST_SDK_VERSION: string;
