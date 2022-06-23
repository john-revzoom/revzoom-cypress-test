import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Image as AntImage, Skeleton, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import classNames from "classnames";
import moment from "moment";
import { UploadingPhoto } from "../../../common/Types";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import styles from "./media-card.module.scss";
import IconThreeDots from "../../assets/icons/icon-three-dots.svg";
import { Dropdown } from "../dropdown";
import { ConversionUtil } from "../../utils";
import axios from "axios";
import API from "../../../util/web/api";
import { Logger } from "aws-amplify";
import { INTERVAL_FOR_THUMB_CHECK, MAX_RETRY_FOR_THUMB_CHECK } from "../../utils/Constants";

/*function getBase64(file: File) {
  return URL.createObjectURL(file);
}*/

type SummaryCardProps = {
  image: UploadingPhoto;
  selected: boolean;
  onSelect: (e: CheckboxChangeEvent, imageId: string) => void;
  onDelete?: (id: string) => void;
  isUploaded?: boolean;
};
const DEFAULT_IMAGE = "/images/default-fallback-image.png";

const MediaCard = ({ image, selected, onSelect, onDelete }: SummaryCardProps) => {
  const logger = new Logger("ui-components.components.media-card");
  const [imageURL, setImageURL] = useState<string>(DEFAULT_IMAGE);
  const [objectFitClass, setObjectFitClass] = useState<string>("fit-cover");
  const [isThumbGenerated, setThumbGeneratedFlag] = useState<boolean>(image.isThumbGenerated);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [imageRepeat, setImageRepeat] = useState<number>(MAX_RETRY_FOR_THUMB_CHECK);

  useEffect(() => {
    if (image?.isThumbGenerated && image?.thumbnailUrl) {
      logger.debug(`media-card useeffect uiId:${image.id} and name: ${image.name} and asset id: ${image.assetId}`);
      setObjectFitClass("fit-contain");
      setImageURL(image.thumbnailUrl);
    }
    return () => setImageURL(DEFAULT_IMAGE);
  }, [image.isThumbGenerated]);

  const deleteImage = (imageName: string) => () => {
    onDelete && onDelete(imageName);
  };

  const menu = [
    {
      id: "delete",
      //Todo: I18n.
      label: "Delete",
      onClick: deleteImage(image.id)
    }
  ];

  const onImageLoad = () => {
    logger.debug(
      `on image load for uiid:${image.id} and assetId: ${image.assetId} and name ${image.name} and thumbgenerated: ${image.isThumbGenerated}`
    );

    if (isThumbGenerated) {
      logger.debug(
        `Image load if part for uiid:${image.id} and assetId: ${image.assetId} and name ${image.name} and isThumbgenerated: ${isThumbGenerated}`
      );
      // if(image?.thumbnailUrl) {
      //   setObjectFitClass("fit-contain");
      // }
      setImageURL(image?.thumbnailUrl || "");
    }
  };

  const onThumbUrlNotFound = () => {
    /* if (imageRepeat > 0) {
      logger.debug(`API call to check for thumb for id: ${image.assetId} and name: ${image.name}`);
      API.isThumbGeneratedForUploadedFile(image.assetId).then(response => {
        if (response.data.is_thumb_generated) {
          logger.debug(
            `thumb generated flag as ${response.data.is_thumb_generated} from API for id: ${image.assetId} and name: ${image.name}`
          );
          setThumbGeneratedFlag(response.data.is_thumb_generated);
          setImageURL(image?.thumbnailUrl || "");
          setImageRepeat(0);
        } else {
          logger.debug(`thumb not generated for id: ${image.assetId} and name: ${image.name}`);
          setImageRepeat(imageRepeat - 1);
          setTimeout(() => {
            onThumbUrlNotFound();
          }, INTERVAL_FOR_THUMB_CHECK);
        }
      });
    } */
  };

  return (
    <div
      className={classNames(styles.Wrapper, { [styles.Selected]: selected || isHover })}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles.ImageView}>
        {!image?.isUploading && imageURL && (
          <>
            <AntImage
              wrapperClassName={objectFitClass}
              src={imageURL}
              loading="lazy"
              alt={image.name}
              preview={false}
              onLoad={onImageLoad}
            />
            {selected || isHover ? <div className={styles.Mask} /> : null}
          </>
        )}
        {image?.isUploading && (
          <>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            {!!image.percent && image.percent > 0 && <span className={styles.Progress}>{image.percent}%</span>}
          </>
        )}
      </div>
      <div className={styles.ContentView}>
        <div className={styles.Section}>
          <h5 className={styles.ImageName} title={image.name}>
            {image.name}
          </h5>
          <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
            <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
          </Dropdown>
        </div>
        <div className={styles.Section}>
          {image.assetId && (
            <>
              <span>{moment(image.lastModified).format("MMM D, YYYY")}</span>
              <span>{ConversionUtil.formatBytes(image.size)}</span>
            </>
          )}
          {!image.assetId && (
            <>
              <Skeleton title={false} paragraph={{ rows: 1 }} active />
              <Skeleton style={{ alignSelf: "end" }} title={false} paragraph={{ rows: 1 }} active />
            </>
          )}
        </div>
      </div>
      <Checkbox className={styles.SelectCheckbox} onChange={e => onSelect(e, image.id)} checked={selected} />
    </div>
  );
};

export default MediaCard;
