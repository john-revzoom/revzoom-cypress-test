// @ts-nocheck
import React, { useEffect } from "react";
import styles from "./smart-crop-canvas.module.scss";
import { CROP_TYPE, MODE } from "../../components/smart-crop-config/smart-crop-config-constants";
import { SmartCropUtil } from "../../../util/SmartCropUtil";
import { CropFromConfig } from "../../../models/CropFromConfig";
import { fabric } from "fabric"; // this also installed on your project
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { MarkerData } from "../../../models/MarkerData";
import { CropType, CropSide, CropSideUtil } from "../../enums";
import { CropAroundConfig } from "../../../models/CropAroundConfig";
import { percentageToPxConvert } from "../../components/smart-crop-config/smartCropUtil";
import { updateCropSize } from "../../../redux/actions/smartcropActions";
import { connect, ConnectedProps } from "react-redux";

type PropsFromRedux = ConnectedProps<typeof connector>;
interface SmartCropCanvasProps extends PropsFromRedux {
  height: any;
  width: any;
  imageURL: string;
  markers?: MarkerData[];
  cropInfo: any;
  cropTypeMode: any;
  currentResizedImage: any;
  setResizeImage: Function;
  isImageLoaded: boolean;
  imageInfo: any;
  isSliding: boolean;
  imageZoomScale: number;
  selectedMarker: MarkerData | undefined;
  selectedMarkerIndex: number | null | undefined;
  setSelectedMarkerIndex: Function;
}

const SmartCropCanvas = ({
  height,
  width,
  imageURL,
  markers,
  cropInfo,
  cropTypeMode,
  currentResizedImage,
  setResizeImage,
  isImageLoaded,
  imageInfo,
  isSliding,
  imageZoomScale,
  updateCropSize,
  selectedMarker,
  selectedMarkerIndex,
  setSelectedMarkerIndex
}: SmartCropCanvasProps) => {
  const { editor, onReady } = useFabricJSEditor();

  if (cropTypeMode === MODE.VIEW && cropInfo?.cropType) {
    const cropConfig =
      cropInfo.cropType == CROP_TYPE.CROP_FROM
        ? new CropFromConfig(cropInfo.isIncludeBoundingBox, cropInfo.cropSize, cropInfo.cropSide)
        : new CropAroundConfig(cropInfo.cropPosition.x, cropInfo.cropPosition.y, cropInfo.cropSize);
    const cropType: CropType = cropInfo.cropType === CROP_TYPE.CROP_AROUND ? CropType.AROUND : CropType.FROM;
    const smartCropConfig = new SmartCropUtil(cropType, cropConfig, width, height, markers);
    const cropArea = smartCropConfig.calculateCropArea();
  }

  useEffect(() => {
    if (cropTypeMode === MODE.VIEW) {
      drawCanvas();
    } else {
      clearCanvas();
    }
  }, [cropInfo, cropTypeMode, width, imageURL, isSliding, height, selectedMarker, selectedMarkerIndex]);

  useEffect(() => {
    if (editor?.canvas) {
      initEvents();
    }
  }, [editor?.canvas, selectedMarker, cropInfo, cropTypeMode]);

  const initEvents = () => {
    editor?.canvas.__eventListeners = {};
    editor?.canvas.on("object:scaling", e => {
      const obj = e.target;
      // handleObjectScaling(obj);
    });

    //ToDO: Remove the border overlapping the crop controls
    editor?.canvas.on("after:render", function () {
      editor?.canvas.contextContainer.strokeStyle = "#0038FF";
      editor?.canvas.contextContainer.lineWidth = "1";
      editor?.canvas.forEachObject(function (obj) {
        console.log("obj", obj, editor?.canvas.getActiveObject(), obj === editor?.canvas.getActiveObject());
        if (obj !== editor?.canvas.getActiveObject()) {
          var bound = obj.getBoundingRect();
          editor?.canvas.contextContainer.strokeRect(bound.left, bound.top, bound.width, bound.height);
        }
      });
    });

    editor?.canvas.on("selection:cleared", e => {
      const currentObject = e.deselected ? e.deselected[0] : null;
      // handleObjectSelect(currentObject);
      editor?.canvas.setActiveObject(currentObject);
    });

    editor?.canvas.on("object:moving", e => {
      const currentObject = e.target;
      handleObjectMoving(currentObject);
    });

    editor?.canvas.on("selection:created", e => {
      const currentObject = e.selected ? e.selected[0] : null;
      handleObjectSelect(currentObject);
    });

    editor?.canvas.on("selection:updated", e => {
      const currentObject = e.selected ? e.selected[0] : null;
      handleObjectSelect(currentObject);
    });

    editor?.canvas.on("object:modified", e => {
      const currentObject = editor?.canvas.getActiveObject();
      handleObjectModified(currentObject);
    });
  };

  const handleObjectSelect = obj => {
    if (obj) {
      console.info("SelectedObject-", obj);
      obj.isSelected;
      setSelectedMarkerIndex(obj.objectMarkerIndex);
    }
  };

  const handleObjectScaling = obj => {
    obj.setCoords();
    if (obj.left < obj.movingLimit.left) {
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      resetScaledObjectLeft(obj);
    }
    if (obj.top < obj.movingLimit.top) {
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      resetScaledObjectTop(obj);
    }
    if (obj.left + obj.getBoundingRect().width > obj.movingLimit.right) {
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      resetScaledObjectRight(obj);
    }
    if (obj.top + obj.getBoundingRect().height > obj.movingLimit.bottom) {
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      resetScaledObjectBottom(obj);
    }
  };

  const resetScaledObjectTop = obj => {
    obj.height = (obj.getBoundingRect().height - Math.abs(obj.top - obj.movingLimit.top)) / obj.scaleY;
    obj.top = Math.max(obj.top, obj.movingLimit.top);
    obj.setCoords();
    obj.canvas.renderAll();
  };
  const resetScaledObjectLeft = obj => {
    obj.width = (obj.getBoundingRect().width - Math.abs(obj.left - obj.movingLimit.left)) / obj.scaleX;
    obj.left = Math.max(obj.left, obj.movingLimit.left);
    obj.setCoords();
    obj.canvas.renderAll();
  };
  const resetScaledObjectRight = obj => {
    obj.width =
      (obj.getBoundingRect().width -
        1 -
        Math.abs(obj.left - (obj.movingLimit.right - obj.getBoundingRect().width + obj.left - obj.left))) /
      obj.scaleX;
    obj.setCoords();
    obj.canvas.renderAll();
  };
  const resetScaledObjectBottom = obj => {
    obj.height =
      (obj.getBoundingRect().height -
        1 -
        Math.abs(obj.top - (obj.movingLimit.bottom - obj.getBoundingRect().height + obj.top - obj.top))) /
      obj.scaleY;
    obj.setCoords();
    obj.canvas.renderAll();
  };

  const handleObjectMoving = obj => {
    if (obj) {
      obj.setCoords();
      obj.movingLimitFunction(obj);
    }
  };

  const handleObjectMovingCropFrom = obj => {
    // top-left  corner
    if (obj.getBoundingRect().top < obj.movingLimit.top || obj.getBoundingRect().left < obj.movingLimit.left) {
      obj.top = Math.max(obj.top, obj.movingLimit.top);
      obj.left = Math.max(obj.left, obj.movingLimit.left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height > obj.movingLimit.bottom ||
      obj.getBoundingRect().left + obj.getBoundingRect().width > obj.movingLimit.right
    ) {
      obj.top = Math.min(
        obj.top,
        obj.movingLimit.bottom - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.movingLimit.right - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left
      );
    }
  };

  const handleObjectMovingCropAround = obj => {};

  const handleObjectModified = obj => {
    console.info("modified", obj);
    updateLeftPanel(obj);
  };

  const updateLeftPanel = obj => {
    const smartCropConfig = new SmartCropUtil(cropType, cropConfig, width, height, markers);
    const updatedCropSize = smartCropConfig?.giveCropSideValuesFromDrag(
      obj.left,
      obj.left + obj.width * obj.scaleX,
      obj.top,
      obj.top + obj.height * obj.scaleY,
      obj.objectMarker
    );
    updateCropSize({
      top: limitCropSize(updatedCropSize.get(CropSide.TOP)),
      bottom: limitCropSize(updatedCropSize.get(CropSide.BOTTOM)),
      left: limitCropSize(updatedCropSize.get(CropSide.LEFT)),
      right: limitCropSize(updatedCropSize.get(CropSide.RIGHT))
    });
  };

  const limitCropSize = value => {
    if (value < 0) {
      return 0;
    } else if (value > 100) {
      return 100;
    }
    return value;
  };

  const addCropBox = () => {
    if (cropArea) {
      if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
        markers?.map((e: any, i: number) => addCropBoxOnCanvas(cropArea[i], i));
      } else {
        const markerIndex = selectedMarkerIndex || 0;
        addCropBoxOnCanvas(cropArea[markerIndex], markerIndex);
      }
    }
  };

  const changeMarker = () => {};

  const addCropBoxOnCanvas = (cropBox, index) => {
    if (cropBox) {
      const rect = new fabric.Rect({
        left: cropBox.x,
        top: cropBox.y,
        width: cropBox.width,
        height: cropBox.height,
        // fill: "#451245",
        cornerSize: 12,
        cornerStrokeColor: "#0038FF",
        cornerColor: "#FFF",
        borderColor: "#0038FF",
        transparentCorners: false,
        movingLimit: getMovingLimit(cropBox),
        movingLimitFunction: getMovingLimitFunction(),
        objectMarkerIndex: index,
        objectMarker: markers[index],
        globalCompositeOperation: "destination-out",
        borderScaleFactor: 2,
        subTargetCheck: true
      });

      editor?.canvas.add(rect);
      rect.setControlsVisibility({ mtr: false });
      if (cropInfo.cropType == CROP_TYPE.CROP_AROUND && markers?.length > 1) {
        if (index == selectedMarkerIndex) {
          editor?.canvas.setActiveObject(rect);
        }
      } else {
        editor?.canvas.setActiveObject(rect);
      }
    }
  };

  const getMovingLimit = rect => {
    if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
      return getMovingLimitCropAround(rect);
    } else {
      return getMovingLimitCropFrom(rect);
    }
  };

  const getMovingLimitCropFrom = rect => {
    const markerIndex = selectedMarkerIndex || 0;
    let top = 0,
      right = editor?.canvas.width,
      bottom = editor?.canvas.height,
      left = 0;
    const cropSide = CropSideUtil.parse(cropInfo.cropSide);
    switch (cropSide) {
      case CropSide.TOP:
        bottom = cropConfig?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.height, markers[markerIndex].y + markers[markerIndex].height)
          : percentageToPxConvert(imageInfo.height, markers[markerIndex].y);
        break;
      case CropSide.RIGHT:
        left = cropConfig?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.width, markers[markerIndex].x)
          : percentageToPxConvert(imageInfo.width, markers[markerIndex].x) +
            percentageToPxConvert(imageInfo.width, markers[markerIndex].width);
        break;
      case CropSide.BOTTOM:
        top = cropConfig?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.height, markers[markerIndex].y)
          : percentageToPxConvert(imageInfo.height, markers[markerIndex].y) +
            percentageToPxConvert(imageInfo.height, markers[markerIndex].height);
        break;
      case CropSide.LEFT:
        right = cropConfig?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.width, markers[markerIndex].x) +
            percentageToPxConvert(imageInfo.width, markers[markerIndex].width)
          : percentageToPxConvert(imageInfo.width, markers[markerIndex].x);
        break;
    }
    return { top: top, right: right, bottom: bottom, left: left };
  };

  const getMovingLimitCropAround = rect => {
    const markerIndex = selectedMarkerIndex || 0;
    let top = 0,
      right = editor?.canvas.width,
      bottom = editor?.canvas.height,
      left = 0;
    return { top: top, right: right, bottom: bottom, left: left };
  };

  const getMovingLimitFunction = () => {
    if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
      return handleObjectMovingCropAround;
    } else {
      return handleObjectMovingCropFrom;
    }
  };

  const clearCanvas = () => {
    if (editor?.canvas) {
      editor?.canvas.clear();
    }
  };

  const drawCanvas = () => {
    editor?.canvas.clear();
    if (isImageLoaded && !isSliding) {
      editor?.canvas?.setWidth(width);
      editor?.canvas?.setHeight(height);
      var overlay = new fabric.Rect({
        left: 0,
        top: 0,
        width: width,
        height: height,
        fill: "#061425",
        opacity: 0.7,
        selectable: false,
        globalCompositeOperation: "source-over"
      });
      editor?.canvas.add(overlay);
      addCropBox();
    }
  };

  return (
    <>
      <FabricJSCanvas className={styles.sampleCanvas} onReady={onReady} />
    </>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  cropSize: state.smartcrop.cropSize
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropCanvas);
