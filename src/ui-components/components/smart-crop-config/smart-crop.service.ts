import { CropMarkerOption, MarkerCoodinates, SaveAutomationConfig } from "./leftpanel/types";
import photodata from "./photodata.json";
import coordinateData from "./cropdata.json";
import API from "../../../util/web/api";
import { CreateSmartCrop } from "./modal/CreateSmartCrop";
import { EditSmartCropConfig } from "./modal/EditSmartCrop";

export const getCropMarkerOptions = function (): Promise<CropMarkerOption[]> {
  return new Promise((resolve, reject) => {
    resolve([
      { label: "Nose", value: "NOSE" },
      { label: "Face", value: "FACE" },
      { label: "Eyes", value: "EYES" },
      { label: "Mouth", value: "MOUTH" }
      // { label: "Ear", value: "EARS" },
      // { label: "Lips", value: "LIPS" }
    ]);
  });
};

export const getImagesConfig = () => {
  return new Promise((resolve, reject) => {
    resolve(photodata);
  });
};

export const getCoordinatesInfo = (i: number): Promise<MarkerCoodinates> => {
  return new Promise((resolve, rejects) => {
    // @ts-ignore
    resolve(coordinateData[i]);
  });
};

export const saveAutomationConfig = (payload: CreateSmartCrop) => {
  return API.createAutomationConfig(payload);
};

export const editAutomationConfig = (payload: EditSmartCropConfig) => {
  return API.editAutomationConfig(payload);
};

export const getAutomationConfig = (id: string, includeConfig: boolean = true, includeJobIds: boolean = true) => {
  return API.getAutomation(id, { config: includeConfig, jobIds: includeJobIds });
};
