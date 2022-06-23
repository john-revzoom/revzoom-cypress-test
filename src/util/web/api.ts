import TenantIdToUserIdToRole from "../../models/TenantIdToUserIdToRole";
import { HTTP, HttpMethod, HttpResponse, HttpResultType, RestClient } from "./http-client";
import Optional from "../Optional";
import { X_TENANT_ID_HEADER_NAME } from "../auth/Authenticator";
import { JSON_TYPE, OBJECT_TYPE } from "../../common/Types";
import AutomationListResponse from "../../models/AutomationListResponse";
import { CreateSmartCrop } from "../../ui-components/components/smart-crop-config/modal/CreateSmartCrop";
import FrontendRuntimeConfigResponse from "../../models/FrontendRuntimeConfigResponse";
import { Logger } from "aws-amplify";
import AutomationResponse from "../../models/AutomationResponse";
import { EditSmartCropConfig } from "../../ui-components/components/smart-crop-config/modal/EditSmartCrop";
import { CreateSmartCropAutomationJob } from "../../ui-components/components/smart-crop-config/modal/CreateAutomationJob";
import { JOB_ACTIONS } from "../../common/Enums";
import SmartCroppedAssetsResultsResponse, {
  SmartCroppedAssetsNextPageToken
} from "../../models/SmartCroppedAssetsResultsResponse";
import AutomationItem from "../../models/AutomationItem";
import AutomationJob from "../../models/AutomationJob";
import JobStartMessage from "../../models/JobStartMessage";
import JobStartResponse from "../../models/JobStartResponse";
import DownloadImageResponse, { DownloadImageToken } from "../../models/DownloadImageResponse";
import DownloadStatusResponse from "../../models/DownloadStatusResponse";

const logger = new Logger("util:web:api", "DEBUG");

const NO_AUTH_CLIENT = new RestClient({});

const API = {
  getOrSetTenantId: async function (): Promise<Optional<TenantIdToUserIdToRole>> {
    const headers: OBJECT_TYPE = { [X_TENANT_ID_HEADER_NAME]: "DefaultTenantId" };
    let httpResponse: HttpResponse = await HTTP.post("/api/v1/user/set-and-get-default-tenant", {
      headers: headers
    });
    return httpResponse.getTyped(TenantIdToUserIdToRole.deserializer());
  },
  //API to rename the Automation
  renameAnAutomation: async function (name: string, id: string) {
    return HTTP.post(`/api/v1/automations/rename/${id}/${encodeURIComponent(name)}`);
  },
  //API to Delete the Automation
  deleteAnAutomation: async function (id: string) {
    return HTTP.post(`/api/v1/automations/delete/${id}`);
  },
  //API to Duplicate the Automation
  duplicateAnAutomation: async function duplicateAnAutomation(id: string, duplicateCheck: object) {
    return HTTP.post(`/api/v1/automations/duplicate/${id}`, {
      queryStringParameters: duplicateCheck
    });
  },
  //get automation list
  getAutomationList: async function getAutomationList(
    filterName: string,
    limit: number,
    start: number
  ): Promise<Optional<AutomationListResponse>> {
    let httpResponse: HttpResponse = await HTTP.get(
      `/api/v1/automations?filter=${encodeURIComponent(filterName)}&limit=${limit}&start=${start}`,
      {}
    );
    return httpResponse.getTyped(AutomationListResponse.deserializer());
  },

  /**
   * Fetches the Runtime config for the frontend from backend server if available.<br>
   * Note: This call doesn't use the normal HTTP Client which does the authentication<br>
   * It uses the RestClient, which doesn't provide and authentication layer for making the calls<br>
   * Frontend config is needed to get the cognito settings for Amplify setup.<br>
   * We will cache this information in the local storage, so that we don't have to make the call everytime.
   */
  getFrontendRuntimeConfig(): Promise<Optional<FrontendRuntimeConfigResponse>> {
    return new Promise<Optional<FrontendRuntimeConfigResponse>>((resolve, reject) => {
      let url = "/api/public/front-end/runtime-config.json";
      let httpResponse = new HttpResponse(NO_AUTH_CLIENT.ajax(url, HttpMethod.GET, {}));
      httpResponse
        .onResponse(response => {
          resolve(FrontendRuntimeConfigResponse.deserializer().deserialize(response));
        })
        .onError(error => {
          logger.warn(error);
          reject(error);
        });
    });
  },

  //create automation config
  createAutomationConfig: async function (automationConfig: CreateSmartCrop): Promise<Optional<AutomationResponse>> {
    let httpResponse: HttpResponse = await HTTP.post("/api/v1/automations/create", {
      body: automationConfig
    });
    const automationItem = await (await httpResponse.getTyped(AutomationItem.deserializer())).get();
    const newAutomationResponse = new AutomationResponse();
    newAutomationResponse.setAutomationItem(automationItem);
    return Optional.of(newAutomationResponse);
  },
  //edit automation config
  editAutomationConfig: async function (automationConfig: EditSmartCropConfig): Promise<Optional<AutomationResponse>> {
    let httpResponse: HttpResponse = await HTTP.post("/api/v1/automations/edit/config", {
      body: automationConfig
    });
    return httpResponse.getTyped(AutomationResponse.deserializer());
  },

  /**
   * Method to get upload data from server for the selected files
   * @param fileCount
   */
  getUploadUrl: (fileCount: number): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = "/api/v1/assets/upload-data";
      let data = { count: fileCount };
      HTTP.get(apiEndPoint, { queryStringParameters: data })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          //todo: @Achin, error not handled. Needs to be propagated to controller, so that UI can display it.
          console.log(error);
          reject(error);
        });
    });
  },

  /**
   * Method to insert values in the DB for the succesfully uploaded file
   * @param automationId
   * @param assetId
   * @param assetName
   * @param size
   * @param session
   */
  entryIntoDBAfterUploadFinish: (
    automationId: string,
    assetId: string,
    assetName: string | undefined,
    size: number | undefined
  ): Promise<any> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = "/api/v1/assets/upload-finished";
      let reqParam = {
        automation_id: automationId.toString(),
        asset_id: assetId.toString(),
        asset_name: assetName,
        size: size
      };
      HTTP.post(apiEndPoint, { body: reqParam })
        .get()
        .then((response: HttpResultType) => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  },

  /**
   * Method to get Thumb url for uploaded files
   * @param assetId
   */
  getThumbUrlForUploadedFile: (assetId: string): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/${assetId}/thumb`;
      HTTP.get(apiEndPoint, {})
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  },
  /**
   * Custom Method for creating presigned for S3 upload
   * @param _signParams
   * @param _signHeaders
   * @param stringToSign
   * @param dateString
   */
  customAuthMethodForSignerURL: (
    _signParams: object,
    _signHeaders: object,
    stringToSign: string,
    dateString: string
  ) => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = "/api/v1/assets/upload/signer-url";
      let data = { queryToSign: decodeURIComponent(stringToSign), datetime: dateString.substr(0, 8) };
      HTTP.get(apiEndPoint, { queryStringParameters: data })
        .get()
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  },
  getAssetsForAutomations: (
    automationId: string,
    start: number,
    limit: number,
    filterName: string | null = null
  ): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/automations/${automationId}/assets?signed_preview=false`;
      let data = { start: start, limit: limit, filter_name: filterName };
      HTTP.get(apiEndPoint, { queryStringParameters: data })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  },
  createSmartCropJobAutomation: (payload: CreateSmartCropAutomationJob): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/jobs/${payload.automation_id}/create`;
      HTTP.post(apiEndPoint, {
        body: payload
      })
        .get()
        .then(response => resolve(response))
        .catch(error => {
          logger.error(error);
          reject(error);
        });
    });
  },
  startSmartCropAutomation: (
    automationId: string,
    jobStartMessage: JobStartMessage
  ): Promise<Optional<JobStartResponse>> => {
    const apiEndPoint = `/api/v1/automations/${automationId}/start`;
    return HTTP.post(apiEndPoint, { body: jobStartMessage.toJson() }).getTyped(JobStartResponse.deserializer());
  },
  getUploadConfig: (): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = "/api/v1/services/upload/config";
      HTTP.get(apiEndPoint, { queryStringParameters: {} })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  deleteAssetFromAutomation: (assetId: string, automationId: string): Promise<HttpResultType> => {
    return API.deleteAssetListFromAutomation([assetId], automationId);
  },
  updateJobStatus: (jobId: string, action: JOB_ACTIONS): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = `/api/v1/jobs/${jobId}/${action}`;
      HTTP.post(apiEndpoint, {})
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("getJobStatus error", error);
          reject(error);
        });
    });
  },
  deleteAssetListFromAutomation: (assetIdList: Array<string>, automationId: string): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/automations/${automationId}/assets/delete`;
      HTTP.post(apiEndPoint, {
        body: { command: "delete", data: { asset_ids: assetIdList } }
      })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("getJobStatus error", error);
          reject(error);
        });
    });
  },
  deleteAllAssetListFromAutomation: (
    automationId: string,
    ignoredAssetList: string[],
    filterText: string
  ): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/automations/${automationId}/assets/delete`;
      HTTP.post(apiEndPoint, {
        body: { command: "delete_all", data: { excluded_asset_ids: ignoredAssetList, filter: filterText } }
      })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("getJobStatus error", error);
          reject(error);
        });
    });
  },
  /***
   * Returns the specific automation
   * @param automationId
   * @param options
   */
  getAutomation: (
    automationId: string,
    options: { config?: boolean; jobIds?: boolean } = {}
  ): Promise<Optional<AutomationResponse>> => {
    let apiEndPoint = `/api/v1/automations/${automationId}`;
    return HTTP.get(apiEndPoint, {
      queryStringParameters: { config: !!options.config, job_ids: !!options.jobIds }
    }).getTyped(AutomationResponse.deserializer());
  },
  getAutomationJob: (automationId: string, jobId: string, asset_ids: number[]): Promise<Optional<AutomationJob>> => {
    const apiEndpoint = `/api/v1/jobs/${jobId}`;
    return HTTP.post(apiEndpoint, {
      body: {
        automation_id: automationId,
        asset_ids
      }
    }).getTyped(AutomationJob.deserializer());
  },
  getAssetDetails: (): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = "/api/v1/smartcrop/configuration-sample-data";
      HTTP.get(apiEndpoint, {})
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("getAssetDetailsList error", error);
          reject(error);
        });
    });
  },
  getSmartCropJobResults: (
    jobId: string,
    limit: number = 20,
    nextPageEntry: null | SmartCroppedAssetsNextPageToken = null
  ): Promise<Optional<SmartCroppedAssetsResultsResponse>> => {
    const apiEndpoint = `/api/v1/jobs/${jobId}/results`;
    return HTTP.get(apiEndpoint, {
      queryStringParameters: {
        limit: limit,
        last_job_id: nextPageEntry?.lastJobId,
        last_crop_id: nextPageEntry?.lastCropId
      }
    }).getTyped(SmartCroppedAssetsResultsResponse.deserializer());
  },
  downloadSmartCroppedImages: (
    jobId: string,
    downloadToken: DownloadImageToken
  ): Promise<Optional<DownloadImageResponse>> => {
    const apiEndpoint = `/api/v1/jobs/${jobId}/download`;
    return HTTP.post(apiEndpoint, {
      body: downloadToken
    }).getTyped(DownloadImageResponse.deserializer());
  },
  getSmartCropDownloadStatus: (
    jobId: string,
    downloadId: string,
    details: JSON_TYPE
  ): Promise<Optional<DownloadStatusResponse>> => {
    const apiEndpoint = `/api/v1/jobs/${jobId}/download/${downloadId}`;
    return HTTP.post(apiEndpoint, {
      body: details
    }).getTyped(DownloadStatusResponse.deserializer());
  },
  //AppConfig API
  getAppConfig: (): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = "/api/v1/frontend/bootstrap";
      HTTP.get(apiEndpoint, {})
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          logger.error("AppConfig error", error);
          reject(error);
        });
    });
  },
  /**
   * Method to get Thumb generation boolean for uploaded files
   * @param assetId
   */
  isThumbGeneratedForUploadedFile: (assetId: string): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = `/api/v1/assets/${assetId}/isThumbGenerated`;
      HTTP.get(apiEndPoint, {})
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  },
  /**
   * Method to get all the assets for assetIds
   * @param assetId
   */
  getAssetList: (assetIdList: Array<number>): Promise<HttpResultType> => {
    return new Promise(function (resolve, reject) {
      const apiEndPoint = "/api/v1/assets/get-asset-list";
      HTTP.post(apiEndPoint, {
        body: assetIdList
      })
        .get()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }
};

export default API;
