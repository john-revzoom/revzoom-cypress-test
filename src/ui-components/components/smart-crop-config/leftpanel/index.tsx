import React, { useEffect, useState } from "react";
import Switch from "antd/lib/switch";
import { connect, ConnectedProps } from "react-redux";
import { useTranslation } from "react-i18next";
import { Divider } from "../../divider";
import Coordinates from "../modal/Coordinates";
import { cardTypeOptions, CROP_TYPE, DIRECTION, MODE } from "../smart-crop-config-constants";
import { getCropMarkerOptions } from "../smart-crop.service";
import CropMarker from "./crop-marker/crop-marker";
import CropSide from "./crop-side/crop-side";
import { CropSize } from "./crop-size/crop-size";
import CropType from "./crop-type/crop-type";
import CropPosition from "./position/crop-position";

import styles from "./smart-crop-config-leftpanel.module.scss";
import { CropMarkerOption } from "./types";
import { SmartCropStructType } from "../../../../redux/structs/smartcrop";
import {
  updateCropPosition,
  updateCropSide,
  updateCropSize,
  updateCropType,
  updateMarker,
  updateMarkersBoundary,
  updateSelectedMarker
} from "../../../../redux/actions/smartcropActions";
import { Dispatch } from "redux";
import { OBJECT_TYPE } from "../../../../common/Types";
import { Logger } from "../../../../lib/logger/Logger";
import classNames from "classnames";
import { datadogLogs } from "@datadog/browser-logs";
import { MarkerData } from "../../../../models/MarkerData";

const cropSideOptions = [
  {
    label: "configuration.left_panel.crop_side.top",
    value: DIRECTION.TOP
  },
  {
    label: "configuration.left_panel.crop_side.right",
    value: DIRECTION.RIGHT
  },
  {
    label: "configuration.left_panel.crop_side.bottom",
    value: DIRECTION.BOTTOM
  },
  {
    label: "configuration.left_panel.crop_side.left",
    value: DIRECTION.LEFT
  }
];

type PropsFromRedux = ConnectedProps<typeof connector>;
interface SmartCropConfigLeftSidePanel extends PropsFromRedux {
  setCrop: Function;
  onCropChange: Function;
  onModeChange: Function;
  coordinateInfo: Coordinates;
  setMarkers: Function;
  markers: MarkerData[];
  imageInfo: any;
  setCropInfo: Function;
  crop: any;
  cropTypeMode: any;
  isDrawing: boolean;
}

const SmartCropConfigLeftSidePanel = ({
  setCropInfo,
  selectedMarker,
  isIncludeMarkersBoundary,
  onModeChange,
  cropTypeMode,
  isImageLoaded,
  imageInfo,
  coordinateInfo,
  setMarkers,
  updateSelectedMarker,
  updateCropPosition,
  updateCropSize,
  cropSide,
  cropSize,
  cropType,
  cropPosition,
  updateCropSide,
  updateCropMarker,
  cropMarker,
  updateMarkersBoundary,
  assets,
  selectedImage
}: SmartCropConfigLeftSidePanel) => {
  const { t } = useTranslation();

  const [cropMarkerOptions, setCropMarkerOptions] = useState<CropMarkerOption[]>([]);
  const logger = new Logger("ui-components:components:smart-crop-config:leftpanel");

  const onCropMarkerChange = (value: string) => {
    datadogLogs.logger.info("Selected Crop Marker", { valueSelected: value });
    updateCropMarker(value);
  };

  useEffect(() => {
    if (cropSide === undefined) updateCropSide("BOTTOM");
  }, [cropSide]);

  useEffect(() => {
    if (!cropMarkerOptions.length) {
      getCropMarkerOptions().then((options: any) => {
        setCropMarkerOptions(options);
      });
    }
    updateCropSide("BOTTOM");
  }, []);

  useEffect(() => {
    if (isImageLoaded) {
      let markers: MarkerData[] | undefined = [];
      if (assets) {
        markers = assets.getCoordinatesByMarker(cropMarker, selectedImage.id);
      }
      if (cropType === CROP_TYPE.CROP_FROM && markers?.length === 1) {
        updateSelectedMarker(markers[0]);
      }
      logger.log(markers);
      setMarkers(markers);
    }
  }, [cropMarker, coordinateInfo, imageInfo, selectedImage, isImageLoaded]);

  useEffect(() => {
    setCropInfo({
      cropType,
      cropSize,
      cropMarker,
      cropPosition,
      cropSide,
      isIncludeBoundingBox: isIncludeMarkersBoundary
    });
  }, [cropType, cropSize, selectedMarker, imageInfo, cropMarker, cropSide, coordinateInfo, isIncludeMarkersBoundary]);

  const handleCropSize = (size: OBJECT_TYPE) => {
    updateCropSize(size);
    console.info("sizesize", size);
  };

  const handleCropPosition = (position: OBJECT_TYPE) => {
    updateCropPosition(position);
  };

  const handleCropSideChange = (side: string) => {
    updateCropSide(side);
  };

  const handleBoundaryChange = () => {
    updateMarkersBoundary(!isIncludeMarkersBoundary);
  };

  return (
    <div className={styles.wrapper}>
      <CropMarker onChange={onCropMarkerChange} disabled={!isImageLoaded} />
      {cropType && <Divider className={styles.divider} />}
      {cropMarker && (
        <CropType
          options={cardTypeOptions}
          selected={cropType}
          onModeChange={onModeChange}
          selectedMode={cropTypeMode}
          onChange={updateCropType}
          disabled={!isImageLoaded}
        />
      )}
      {cropTypeMode === MODE.VIEW ? (
        <>
          {cropType === CROP_TYPE.CROP_FROM ? (
            <>
              <CropSide options={cropSideOptions} active={cropSide} onChange={handleCropSideChange} />
              <div className={styles.isIncludeBoundBox}>
                <Switch
                  checked={isIncludeMarkersBoundary}
                  onChange={handleBoundaryChange}
                  className={classNames(styles.customSwitch, {
                    [styles.customSwitchChecked]: isIncludeMarkersBoundary
                  })}
                  disabled={!isImageLoaded}
                />
                <span className={styles.isIncludeBoundBoxLabel}>{t("configuration.left_panel.checkbox_label")}</span>
              </div>
            </>
          ) : // <CropPosition
          //   cropPosition={cropPosition}
          //   onCropPositionChange={handleCropPosition}
          //   disabled={!isImageLoaded}
          // />
          null}
          <CropSize
            updateCropSize={updateCropSize}
            values={cropSize}
            onChange={handleCropSize}
            disabled={!isImageLoaded}
            cropType={cropType}
          />
        </>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  isImageLoaded: state.smartcrop.isImageLoaded,
  cropSide: state.smartcrop.cropSide,
  cropSize: state.smartcrop.cropSize,
  cropType: state.smartcrop.cropType,
  cropMarker: state.smartcrop.currentMarker,
  cropPosition: state.smartcrop.cropPosition,
  isIncludeMarkersBoundary: state.smartcrop.isIncludeMarkersBoundary,
  selectedMarker: state.smartcrop.selectedMarker,
  markerOptions: state.smartcrop.markerOptions,
  assets: state.smartcrop.assets,
  selectedImage: state.smartcrop.selectedImage
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateSelectedMarker: (marker: MarkerData) => dispatch(updateSelectedMarker(marker)),
  updateCropPosition: (position: OBJECT_TYPE) => dispatch(updateCropPosition(position)),
  updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size)),
  updateCropSide: (side: string) => dispatch(updateCropSide(side)),
  updateMarkersBoundary: (include: boolean) => dispatch(updateMarkersBoundary(include)),
  updateCropMarker: (marker: string) => dispatch(updateMarker(marker))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropConfigLeftSidePanel);
