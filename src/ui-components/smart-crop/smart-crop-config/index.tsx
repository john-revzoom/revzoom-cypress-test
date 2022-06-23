import React, { useEffect, useMemo, useState } from "react";
import { Logger } from "aws-amplify";
import omit from "lodash/omit";
import isEmpty from "lodash/isEmpty";
import CropHeader from "../../components/smart-crop-config/crop-header";
import SmartCropConfigLeftSidePanel from "../../components/smart-crop-config/leftpanel";
import Coordinates from "../../components/smart-crop-config/modal/Coordinates";
import SmartCropConfigRightSidePanel from "../../components/smart-crop-config/rightpanel";
import { editAutomationConfig, saveAutomationConfig } from "../../components/smart-crop-config/smart-crop.service";
import { createSaveConfigPayload, editConfigPayload } from "../../components/smart-crop-config/smartCropUtil";
import { OBJECT_TYPE, SelectedImage } from "../../../common/Types";
import { CROP_TYPE, MODE } from "../../components/smart-crop-config/smart-crop-config-constants";
import { connect, ConnectedProps } from "react-redux";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import {
  updateAssets,
  updateAutomationId,
  updateCropSize,
  updateImageIds,
  updateMarker,
  updateMarkerOptions,
  updateSelectedImage
} from "../../../redux/actions/smartcropActions";
import { Dispatch } from "redux";
import Head from "next/head";
import API from "../../../util/web/api";
import SmartCropAssets from "../../components/smart-crop-config/modal/SmartCropAssets";
import { useIntercom } from "react-use-intercom";
import { MarkerData } from "../../../models/MarkerData";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface SmartCropConfigProps extends PropsFromRedux {
  onConfigSave: Function;
  automationId: string;
  displayView: boolean;
  hasConfig: boolean;
}

const SmartCropConfig = ({
  onConfigSave,
  selectedMarker,
  automationId: selectedAutomationId,
  smartCropStatus,
  selectedImage,
  updateSelectedImage,
  updateImageIds,
  updateMarkerOptions,
  updateAssets,
  displayView,
  hasConfig
}: SmartCropConfigProps) => {
  const logger = new Logger("ui-components:smart-crop:smart-crop-config");
  const [crop, setCrop] = useState([]);
  const [coordinateInfo, setCoordinateInfo] = useState<Coordinates>(new Coordinates({}));
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [imageInfo, setImageInfo] = useState<any>();
  const [cropInfo, setCropInfo] = useState<OBJECT_TYPE>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropTypeMode, setCropTypeMode] = useState<string>(MODE.EDIT);
  const { hide: hideIntercom, update: updateIntercom, trackEvent } = useIntercom();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (displayView === true && hasConfig) {
      setCropTypeMode(MODE.VIEW);
    }
  }, [displayView, cropInfo]);

  useEffect(() => {
    API.getAssetDetails().then(response => {
      const smartCropAssets = new SmartCropAssets(response.data.entries);
      const assetIds = smartCropAssets.getAllAssetsId();
      const defaultId = assetIds[0];
      const markerOptions = smartCropAssets.getAllMarkerOptionsById(defaultId).map(marker => ({
        label: marker.toLowerCase(),
        value: marker
      }));
      const defaultImage = smartCropAssets.getImageById(defaultId);
      updateMarker(markerOptions[0].value);
      updateAssets(smartCropAssets);
      updateMarkerOptions(markerOptions);
      updateSelectedImage(defaultImage);
      updateImageIds(assetIds);
      updateIntercom({
        verticalPadding: 70,
        hideDefaultLauncher: false
      });
    });
    updateIntercom({
      hideDefaultLauncher: true
    });

    return () => {
      logger.info("unmount cleanup SmartCropConfig");
      updateIntercom({
        verticalPadding: 30
      });
      hideIntercom();
      setMarkers([]);
      setImageInfo({});
      setCropInfo({});
    };
  }, []);

  const onModeChange = (mode: string) => {
    setCropTypeMode(mode);
  };

  const onCropChange = (crop: any) => {
    logger.info("onCropMarkerChange", crop);
  };

  useEffect(() => {
    logger.info("Croping Data", crop);
  }, [crop]);

  const onSaveClick = async () => {
    let automationId = selectedAutomationId;
    logger.info("onSaveClick");
    setIsLoading(true);
    try {
      if (automationId && smartCropStatus === AUTOMATION_STATUS.NOT_CONFIGURED) {
        // let id = automationId;
        await sendEditConfig(automationId);
      } else {
        const automationId1 = await sendCreateConfig();
        automationId = automationId1;
        trackEvent("crop-configure-completed"); //We will know that they have finished the configurator
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      logger.error("onSaveClick error", e);
    }
    onConfigSave(AUTOMATION_STATUS.CONFIGURED, `/smart-crop?automationId=${automationId}`);
  };

  const sendEditConfig = async (automationId: string) => {
    logger.info("sending request to edit automation config", cropInfo);
    const payload = editConfigPayload(cropInfo, automationId);
    await editAutomationConfig(payload);
  };

  const sendCreateConfig = async () => {
    logger.info("sending request to create new automation", cropInfo);
    const payload = createSaveConfigPayload(cropInfo);
    console.log("after create payload", payload);
    const response = await saveAutomationConfig(payload);
    console.log("sendCreateConfig response", response);
    if (response.isPresent()) {
      const automationResponse = response.get();
      const automation = automationResponse.getAutomation();
      if (automation) return automation.getAutomationId();
    }
    return "0";
  };

  const isConfigComplete = useMemo(() => {
    logger.info("getValidation of create automation", cropInfo);
    if (!cropInfo || cropTypeMode === "EDIT") return false;

    const crop = omit(cropInfo, ["cropPosition", "isIncludeBoundingBox"]);
    if (crop.cropType === CROP_TYPE.CROP_AROUND) {
      return Object.values(crop).every(c => !isEmpty(c));
    }
    if (crop.cropType === CROP_TYPE.CROP_FROM && selectedMarker) {
      const marker = selectedMarker as Object;
      const newMarker = omit(marker, "unit");
      const isCropInfoComplete = Object.values(crop).every(c => !isEmpty(c));
      const hasSelectedMarker = Object.values(newMarker).some(m => Number(m) > 0);
      return isCropInfoComplete && hasSelectedMarker;
    }
    return false;
  }, [cropInfo, selectedMarker, selectedImage, cropTypeMode]);

  return (
    <>
      <CropHeader onSaveClick={onSaveClick} isConfigComplete={isConfigComplete} isLoading={isLoading} />
      {selectedImage && (
        <div
          style={{
            display: "flex",
            height: "calc(100vh - 70px)",
            overflow: "hidden"
          }}
        >
          <SmartCropConfigLeftSidePanel
            onCropChange={onCropChange}
            onModeChange={onModeChange}
            coordinateInfo={coordinateInfo}
            setCrop={setCrop}
            markers={markers}
            setMarkers={setMarkers}
            imageInfo={imageInfo}
            setCropInfo={setCropInfo}
            crop={crop}
            isDrawing={isDrawing}
            cropTypeMode={cropTypeMode}
          />
          <SmartCropConfigRightSidePanel
            crop={crop}
            setCrop={setCrop}
            markers={markers}
            setImageInfo={setImageInfo}
            coordinateInfo={coordinateInfo}
            cropInfo={cropInfo}
            imageInfo={imageInfo}
            setIsDrawing={setIsDrawing}
            cropTypeMode={cropTypeMode}
          />
        </div>
      )}
    </>
  );
};
const mapStateToProps = (state: any) => ({
  selectedMarker: state.smartcrop.selectedMarker,
  smartCropStatus: state.smartcrop.smartCropStatus,
  selectedImage: state.smartcrop.selectedImage,
  marker: state.smartcrop.currentMarker
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateAutomationId: (id: number) => dispatch(updateAutomationId(id)),
  updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size)),
  updateSelectedImage: (image: SelectedImage) => dispatch(updateSelectedImage(image)),
  updateMarkerOptions: (options: OBJECT_TYPE[]) => dispatch(updateMarkerOptions(options)),
  updateImageIds: (ids: string[]) => dispatch(updateImageIds(ids)),
  updateAssets: (assets: SmartCropAssets) => dispatch(updateAssets(assets)),
  updateMarker: (marker: string) => dispatch(updateMarker(marker))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropConfig);
