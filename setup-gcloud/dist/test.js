"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const restm = __importStar(require("typed-rest-client/RestClient"));
function queryGcloudSDKRelease(osPlat, osArch, versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        let objectName;
        switch (osPlat) {
            case 'linux':
                objectName = `google-cloud-sdk-${versionSpec}-linux-${osArch}.tar.gz`;
                break;
            case 'darwin':
                objectName = `google-cloud-sdk-${versionSpec}-darwin-${osArch}.tar.gz`;
                break;
            case 'win32':
                objectName = `google-cloud-sdk-${versionSpec}-windows-${osArch}.zip`;
                break;
            default:
                throw new Error(`Unexpected OS '${osPlat}'`);
        }
        let dataUrl = `https://storage.googleapis.com/cloud-sdk-release/o?prefix='${objectName}`;
        let rest = new restm.RestClient('github-actions-setup-gcloud');
        let listReleasesResponse = (yield rest.get(dataUrl)).result || null;
        // get the latest generation that matches the version spec
        let release = listReleasesResponse.items.sort((a, b) => {
            if (a.generation > b.generation) {
                return 1;
            }
            return -1;
        })[0];
        if (release) {
            return { name: release.name, url: release.mediaLink, version: versionSpec };
        }
        return null;
    });
}
exports.queryGcloudSDKRelease = queryGcloudSDKRelease;
