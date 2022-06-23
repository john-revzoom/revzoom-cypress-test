import { FC, useState } from "react";
import { Skeleton, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import classNames from "classnames";
import { JSON_TYPE, Photo } from "../../../common/Types";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import styles from "./media-card.module.scss";
import IconThreeDots from "../../assets/icons/icon-three-dots.svg";
import { Dropdown } from "../dropdown";
import { ConversionUtil } from "../../utils";
import { useTranslation } from "react-i18next";
import IconWarning from "../../assets/icons/icon-warning.svg";
import { Tooltip } from "../tooltip";
import { FacebookBlack, InstagramBlack, LinkedInBlack, PinterestBlack, TwitterBlack } from "../../assets";
import { CropConfigName } from "../../smart-crop/select-format/select-format-utils";
import MediaSize from "../../../models/MediaSize";
import { Dispatch } from "redux";
import { updateLargePreview } from "../../../redux/actions/smartcropActions";
import { connect, ConnectedProps } from "react-redux";
import { DownloadImageToken } from "../../../models/DownloadImageResponse";
import { useRouter } from "next/router";
import { LoadingOutlined } from "@ant-design/icons";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface MediaCardProps extends PropsFromRedux {
  image: Photo;
  isSelected: boolean;
  onSelect: (e: CheckboxChangeEvent, croppedId: string) => void;
  onDelete?: Function;
  onDownload: Function;
}

const MediaCard: FC<MediaCardProps> = ({ image, isSelected, onSelect, onDownload, updateLargePreview }) => {
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const downloadImage = (imageId: string) => () => {
    const downloadToken = new DownloadImageToken();
    downloadToken.automation_id = router?.query?.automationId as string;
    downloadToken.crop_ids = [imageId];
    onDownload && onDownload(downloadToken);
  };

  const handleImageViewClick = () => {
    if (image?.imageUrl && image?.id) {
      router.push(router?.asPath);
      console.log("handleImageViewClick", router);
      updateLargePreview({
        id: image.id,
        name: image?.name,
        url: image.imageUrl
      });
    }
  };

  const menu = [
    {
      id: "download",
      label: "Download",
      onClick: downloadImage(image?.id as string)
    }
  ];

  return (
    <div
      className={classNames(styles.SummaryCardWrapper, {
        [styles.Selected]: isSelected || isHover
      })}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles.ImageView} onClick={handleImageViewClick}>
        {!isImageLoaded ? (
          <div className={styles.projectSkeleton}>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            <span className={styles.Progress} />
          </div>
        ) : null}
        {image?.thumbnailUrl ? (
          <>
            <img
              src={`${image?.thumbnailUrl}`}
              loading="lazy"
              alt={""}
              onLoad={() => setIsImageLoaded(true)}
              onLoadStart={() => setIsImageLoaded(false)}
              style={{
                backgroundImage: isImageLoaded
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)"
                  : "none"
              }}
            />
            {isSelected || isHover ? <div className={styles.Mask} /> : null}
          </>
        ) : null}
      </div>
      <div className={styles.ContentView}>
        <div className={styles.Section}>
          {image.errorCode ? (
            <span className={styles.ImageWarning}>
              <Tooltip title={t(image.errorCode)} placement="top">
                <IconWarning fill="#FDBE1B" width="14.67px" height="12.67px" />
              </Tooltip>
            </span>
          ) : null}
          <h5 className={styles.ImageName} title={image.name}>
            {image.name}
          </h5>
          {/* {image.errorCode ? null : (
            <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
              <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
            </Dropdown>
          )} */}
          <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
            <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
          </Dropdown>
        </div>
        <div
          className={classNames(styles.BottomSection, {
            // [styles.Hidden]: image.errorCode
          })}
        >
          {image.id && (
            <>
              <CropConfigNameIcon configName={image.cropConfigName} />
              <p className={styles.BottomInfo}>
                <DimensionText mediaSize={image.dimension} />
                {image?.size ? (
                  <span className={styles.ImageSize} title={ConversionUtil.formatBytes(image.size)}>
                    {ConversionUtil.formatBytes(image.size)}
                  </span>
                ) : null}
              </p>
            </>
          )}
          {!image.id && (
            <>
              <Skeleton title={false} paragraph={{ rows: 2 }} active />
              <Skeleton style={{ alignSelf: "end" }} title={false} paragraph={{ rows: 1 }} active />
            </>
          )}
        </div>
      </div>
      {/* {image.errorCode ? null : (
        <Checkbox
          className={styles.SelectCheckbox}
          onChange={e => onSelect(e, image.id as string)}
          checked={isSelected}
        />
      )} */}
      <Checkbox
        className={styles.SelectCheckbox}
        onChange={e => onSelect(e, image.id as string)}
        checked={isSelected}
      />
    </div>
  );
};

type CropConfigNameIconProps = {
  configName?: CropConfigName;
};

function DimensionText({ mediaSize }: { mediaSize?: MediaSize }) {
  if (!!mediaSize && mediaSize.width && mediaSize.height) {
    return (
      <span className={styles.MediaSize}>
        {mediaSize?.width}x{mediaSize?.height}
      </span>
    );
  }
  return null;
}

function CropConfigNameIcon(props: CropConfigNameIconProps) {
  const configName = props.configName;
  let element: JSX.Element | null = null;
  if (configName) {
    if (configName == CropConfigName.FACEBOOK) {
      element = <FacebookBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.INSTAGRAM) {
      element = <InstagramBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.LINKEDIN) {
      element = <LinkedInBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.TWITTER) {
      element = <TwitterBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.PINTEREST) {
      element = <PinterestBlack style={{ width: 16, height: 16 }} />;
    }
  }
  if (element) {
    return <>{element}&nbsp;</>;
  }
  return null;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateLargePreview: (data: JSON_TYPE | undefined) => dispatch(updateLargePreview(data))
});

const connector = connect(null, mapDispatchToProps);

export default connector(MediaCard);
