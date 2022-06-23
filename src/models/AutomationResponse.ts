import { SmartCropAutomationConfiguration } from "../ui-components/components/smart-crop-config/modal/CreateSmartCrop";
import Optional from "../util/Optional";
import { HttpResultType } from "../util/web/http-client";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import AutomationItem from "./AutomationItem";
import { ArrayUtil } from "../ui-components/utils";

export default class AutomationResponse {
  private automation?: AutomationItem;
  private smart_crop_configuration?: SmartCropAutomationConfiguration;
  private _automationJobIds: Array<string> = [];
  private _latestJobId: string = "";

  constructor() {}

  getAutomationJobIds(): Array<string> {
    return this._automationJobIds;
  }

  getLatestJobId(): string {
    return this._latestJobId;
  }

  getAutomationDetails() {
    return this.automation;
  }

  getAutomation() {
    return this.automation;
  }

  getAutomationJobId() {
    return this.automation?.getAutomationId();
  }

  getSmartCropConfigDetails() {
    return this.smart_crop_configuration;
  }

  getAutomationStatus() {
    return this.automation?.getStatus();
  }

  getCropType() {
    return this.smart_crop_configuration?.crop_type;
  }

  getCropSide() {
    return this.smart_crop_configuration?.crop_from_config?.crop_side;
  }

  getCropSize() {
    return this.smart_crop_configuration?.crop_from_config?.crop_side_values;
  }

  getMarker() {
    return this.smart_crop_configuration?.marker;
  }

  isIncludeMarkersBoundary() {
    if (this.smart_crop_configuration) {
      return this.smart_crop_configuration.crop_from_config?.include_markers_boundary;
    }
    return false;
  }

  setAutomationItem(automation: AutomationItem) {
    this.automation = automation;
  }

  static deserializer(): HttpResponseDeserializer<AutomationResponse> {
    return new (class implements HttpResponseDeserializer<AutomationResponse> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationResponse> {
        if (httpResultType) {
          const data = httpResultType.data;
          if (data) {
            let automation = AutomationItem.toAutomationItem(data.automation);
            let smartCropConfiguration = data.smart_crop_automation_configuration;
            let automationJobIds: string[] = ArrayUtil.nullToEmpty(data.automation_job_ids);
            let latestJobId = data.latest_job_id;
            const automationResponse = new AutomationResponse();
            automationResponse.automation = automation;
            automationResponse.smart_crop_configuration = smartCropConfiguration;
            automationResponse._automationJobIds = automationJobIds;
            automationResponse._latestJobId = latestJobId;
            return Optional.of(automationResponse);
          }
        }
        return Optional.empty();
      }
    })();
  }
}
