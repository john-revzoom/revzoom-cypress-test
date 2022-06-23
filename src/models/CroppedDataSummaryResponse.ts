import { RectangleShape } from "./RectangleShape";
import { Dimension, JSON_TYPE } from "../common/Types";
import moment, { Moment } from "moment";
import MediaSize from "./MediaSize";
import { CropConfigName, toEnumCropConfigName } from "../ui-components/smart-crop/select-format/select-format-utils";

export default class CroppedDataSummaryResponse {
  constructor() {}

  private _inputImageDimensions: MediaSize = new MediaSize(0, 0);
  private _croppedOutputThumbSignedUrl: string = "";
  private _asset_id: number = 0;
  private _cropId: string = "";
  private _croppingArea: RectangleShape = new RectangleShape(0, 0, 0, 0);
  private _cropGenerated: boolean = false;
  private _croppedOutputPreviewUrl: string = "";
  private _cropSize: number = 0;
  private _cropName: string = "";
  private _croppedOutputPreviewSignedUrl: string = "";
  private _isoDate: Moment = moment();
  private _errorCode: string = "";

  get inputImageDimensions(): MediaSize {
    return this._inputImageDimensions;
  }

  set inputImageDimensions(value: MediaSize) {
    this._inputImageDimensions = value;
  }

  private _cropImageDimensions: MediaSize = new MediaSize(0, 0);

  get cropImageDimensions(): MediaSize {
    return this._cropImageDimensions;
  }

  get errorCode(): string {
    return this._errorCode;
  }

  set errorCode(error: string) {
    this._errorCode = error;
  }

  get cropSize(): number {
    return this._cropSize;
  }

  set cropSize(value: number) {
    this._cropSize = value;
  }

  get cropName(): string {
    return this._cropName;
  }

  set cropName(value: string) {
    this._cropName = value;
  }

  get croppedOutputPreviewSignedUrl(): string {
    return this._croppedOutputPreviewSignedUrl;
  }

  set croppedOutputPreviewSignedUrl(value: string) {
    this._croppedOutputPreviewSignedUrl = value;
  }

  get isoDate(): moment.Moment {
    return this._isoDate;
  }

  set isoDate(value: moment.Moment) {
    this._isoDate = value;
  }

  setIsoDate(v: string) {
    this._isoDate = moment(v);
  }

  get croppedOutputThumbSignedUrl(): string {
    return this._croppedOutputThumbSignedUrl;
  }

  set croppedOutputThumbSignedUrl(value: string) {
    this._croppedOutputThumbSignedUrl = value;
  }

  get croppedOutputPreviewUrl(): string {
    return this._croppedOutputPreviewUrl;
  }

  set croppedOutputPreviewUrl(value: string) {
    this._croppedOutputPreviewUrl = value;
  }

  get asset_id(): number {
    return this._asset_id;
  }

  set asset_id(value: number) {
    this._asset_id = value;
  }

  get cropId(): string {
    return this._cropId;
  }

  set cropId(value: string) {
    this._cropId = value;
  }

  get croppingArea(): RectangleShape {
    return this._croppingArea;
  }

  set croppingArea(value: RectangleShape) {
    this._croppingArea = value;
  }

  get cropGenerated(): boolean {
    return this._cropGenerated;
  }

  set cropGenerated(value: boolean) {
    this._cropGenerated = value;
  }

  set cropImageDimensions(value: MediaSize) {
    this._cropImageDimensions = value;
  }

  private _cropConfigName: string = "";

  get cropConfigName(): string {
    return this._cropConfigName;
  }

  set cropConfigName(value: string) {
    this._cropConfigName = value;
  }

  getCropConfigEnum(): CropConfigName | undefined {
    return toEnumCropConfigName(this.cropConfigName);
  }

  public static toCroppedDataSummaryResponse(object: JSON_TYPE): CroppedDataSummaryResponse {
    const croppedDataSummaryResponse = new CroppedDataSummaryResponse();
    croppedDataSummaryResponse.asset_id = object["asset_id"];
    croppedDataSummaryResponse.cropGenerated = object["crop_generated"];
    croppedDataSummaryResponse.cropId = object["crop_id"];
    croppedDataSummaryResponse.cropSize = object["crop_size"];
    croppedDataSummaryResponse.cropName = object["crop_name"];
    croppedDataSummaryResponse.croppedOutputPreviewSignedUrl = object["cropped_output_preview_signed_url"];
    croppedDataSummaryResponse.croppedOutputThumbSignedUrl = object["cropped_output_thumb_signed_url"];
    croppedDataSummaryResponse.setIsoDate(object["iso_date"]);
    croppedDataSummaryResponse.croppingArea = RectangleShape.toRectangleShape(object["cropping_area"]);
    croppedDataSummaryResponse.errorCode = object["error_code"];
    croppedDataSummaryResponse.cropConfigName = object["crop_config_name"];
    croppedDataSummaryResponse.inputImageDimensions = MediaSize.fromJson(object["input_image_dimensions"]);
    croppedDataSummaryResponse.cropImageDimensions = MediaSize.fromJson(object["crop_image_dimensions"]);
    return croppedDataSummaryResponse;
  }
}
