import { CropStatus } from "../ui-components/enums";
import exp from "constants";
import MediaSize from "../models/MediaSize";
import { CropConfigName } from "../ui-components/smart-crop/select-format/select-format-utils";

export type OBJECT_TYPE = { [key: string]: any };
export type JSON_TYPE = { [key: string]: any };

export type ComponentProp = {
  className?: string;
  children?: React.ReactNode;
};

export type SelectedImage = {
  url: string;
  id: string;
};

// Deprecated
export type RawPhoto = {
  id: string;
  alt: string;
  photographer: string;
  width: number;
  height: number;
  src: {
    tiny: string;
    small: string;
    large: string;
    large2x: string;
    original: string;
  };
};

export type Dimension = {
  width: number;
  height: number;
};

export type Photo = {
  id: string;
  name: string;
  mask?: [number, number, number, number];
  cropStatus?: CropStatus;
  imageUrl?: string;
  thumbnailUrl?: string;
  size?: number;
  createdAt?: number;
  lastModified?: number;
  file?: File | null;
  isoDate?: Date;
  errorCode?: string;
  dimension?: MediaSize;
  cropConfigName?: CropConfigName;
};

export type UploadingPhoto = Photo & {
  percent?: number;
  isUploading?: boolean;
  isThumbGenerated: boolean;
  assetId: string;
};

export type UploadAssetDataFromAPI = {
  upload_path: string;
  asset_id: string;
};
export type UploadFinishAPIResponse = {
  asset_data: AssetData;
  success: boolean;
};

export enum MediaGenerationStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export type AssetData = {
  id: string;
  name: string;
  size: number;
  thumb_url: string;
  thumb_generated: MediaGenerationStatus;
  preview_generated: MediaGenerationStatus;
  preview_url: string;
};

export type AssetUploadUrlDataFRomAPI = {
  asset_upload_data: UploadAssetDataFromAPI[];
};

export type CustomModalProps = {
  title?: string;
  okText?: string;
  cancelText?: string;
  onOk?: (e: React.MouseEventHandler<HTMLElement>) => void;
};

export type AssetsForAutomationResponse = {
  entries: AssetData[];
  total: number;
  count: number;
};
