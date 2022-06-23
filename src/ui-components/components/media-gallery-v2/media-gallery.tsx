import { createRef, KeyboardEvent, useCallback, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { Spin, Col, Row } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import IconDownload from "../../assets/icons/icon-download.svg";

import { Button, PrimaryButton } from "../button";
import { Checkbox } from "../checkbox";
import { SearchInput } from "../search-input";
import { Dropdown } from "../dropdown";
import classNames from "classnames";
import { HLayout } from "../hLayout";
import LazyLoad from "react-lazyload";
import IconAngleDown from "../../assets/icons/icon-angle-down.svg";

import styles from "./media-gallery.module.scss";
import { Photo } from "../../../common/Types";
import MediaCard from "../media-card-v2/media-card";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import { Logger } from "aws-amplify";
import { connect, ConnectedProps } from "react-redux";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import useWhyDidYouUpdate from "../../../hooks/useWhyDidYouUpdate";
import { updateDownloadAll } from "../../../redux/actions/smartcropActions";
import { Dispatch } from "redux";
import { CustomModal } from "../modal";

enum Select {
  ALL = "all",
  VISIBLE = "visible"
}

type PropsFromRedux = ConnectedProps<typeof connector>;

interface MediaGalleryProps extends PropsFromRedux {
  selectedImages: string[];
  onSearchImages: Function;
  onSelectImages: Function;
  onSelectChange: (selections: string[]) => void;
  onClearSearch: Function;
  totalImagesLength: number;
  currentImagesLength: number;
  getNextResultsPage: Function;
  isDownloading: boolean;
  className: string;
  isLoaded: boolean;
  onSingleCardDownload: Function;
  onDownload: Function;
  downloadText?: string;
  totalDownloadCount: number;
}
const logger = new Logger("ui-components:components:media-gallery-v2");
function MediaGallery({
  images,
  selectedImages,
  onSearchImages,
  onSelectImages,
  onSelectChange,
  onClearSearch,
  totalImagesLength,
  getNextResultsPage,
  isLoaded,
  automationStatus,
  onSingleCardDownload,
  onDownload,
  downloadText,
  isDownloading,
  updateDownloadAll,
  downloadAll,
  totalDownloadCount
}: MediaGalleryProps) {
  const [searchText, setSearchText] = useState<string>("");
  const [nextPageLoading, setNextPageLoading] = useState<boolean>(false);
  const [showDownloadAllModal, setShowDownloadAllModal] = useState<boolean>(false);
  const galleryRef = createRef<HTMLDivElement>();
  const isRunning = automationStatus === AUTOMATION_STATUS.RUNNING;
  const { t } = useTranslation();

  useWhyDidYouUpdate("MediaGalleryProps", {
    images,
    selectedImages,
    onSearchImages,
    onSelectImages,
    onSelectChange,
    onClearSearch,
    totalImagesLength,
    getNextResultsPage,
    isLoaded,
    automationStatus,
    onSingleCardDownload,
    isDownloading,
    downloadText,
    onDownload
  });

  const handlePressEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (onSearchImages) {
      const isSearchFromServer = onSearchImages((e.target as HTMLInputElement).value);
      if (!isSearchFromServer) {
        setSearchText((e.target as HTMLInputElement).value);
      }
    } else {
      setSearchText((e.target as HTMLInputElement).value);
    }
  };

  function handleFilterNameChange(value: string) {
    if (isEmpty(value)) {
      onClearSearch();
    }
  }

  const handleClear = () => {
    onClearSearch();
  };

  const getFilteredImages = (images: Photo[], searchText: string) => {
    if (searchText) {
      return images.filter(img => img?.name.toUpperCase().includes(searchText.toUpperCase()));
    } else {
      return images;
    }
  };

  const galleryScrollListener = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      logger.debug("galleryScrollListener status", automationStatus);

      const scrollHeight = (e.target as HTMLDivElement).scrollHeight;
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      const clientHeight = (e.target as HTMLDivElement).clientHeight;
      const filteredImages = getFilteredImages(images, searchText);
      if (Math.ceil(scrollTop) === Math.ceil(scrollHeight - clientHeight)) {
        if (
          totalImagesLength !== undefined &&
          getNextResultsPage &&
          filteredImages.length < totalImagesLength &&
          !nextPageLoading
        ) {
          setNextPageLoading(true);
          getNextResultsPage().then(() => {
            setNextPageLoading(false);
          });
        }
      }
    },
    [images, searchText, nextPageLoading, automationStatus]
  );

  const getCleanImageIds = useCallback(() => {
    //NOTE: commented out filter for no face detected images
    // const validImages = images.filter(image => !image.errorCode);
    return images.map(image => image.id);
  }, [images, selectedImages]);

  const handleSelectAll = useCallback(() => {
    const imageIds = getCleanImageIds();
    if (selectedImages.length > 0) {
      onSelectImages([]);
      updateDownloadAll(false);
    } else {
      onSelectImages(imageIds);
      updateDownloadAll(true);
    }
  }, [images, selectedImages]);

  const handleSelectAllVisible = useCallback(() => {
    const imageIds = getCleanImageIds();
    if (selectedImages.length > 0) {
      onSelectImages([]);
    } else {
      console.log("imageIds", imageIds.length);
      onSelectChange(imageIds as string[]);
    }
    if (downloadAll) {
      updateDownloadAll(false);
    }
  }, [images, selectedImages]);

  const handleSelectChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      handleSelectAll();
    } else {
      updateDownloadAll(false);
      onSelectChange([]);
    }
  };

  const dropdownMenu = useMemo(
    () => [
      {
        id: Select.ALL,
        label: "Select all",
        onClick: handleSelectAll
      },
      {
        id: Select.VISIBLE,
        label: "Select visible",
        onClick: handleSelectAllVisible
      }
    ],
    [handleSelectAll, handleSelectAllVisible]
  );

  const handleSelectImage = (e: CheckboxChangeEvent, croppedId: string) => {
    if (e.target.checked) {
      onSelectChange([...selectedImages, croppedId]);
    } else {
      const index = selectedImages.indexOf(croppedId);
      selectedImages.splice(index, 1);
      onSelectChange([...selectedImages]);
    }
  };

  return (
    <>
      <div className={styles.Header}>
        <Dropdown dropdownItems={dropdownMenu} placement="bottomLeft" triggerOn="click">
          <Button className={styles.Checker}>
            <Checkbox
              onChange={handleSelectChange}
              checked={images?.length > 0 && selectedImages.length === images.length}
              indeterminate={selectedImages.length > 0 && selectedImages.length < images.length}
              onClick={e => e.stopPropagation()}
            />
            <IconAngleDown />
          </Button>
        </Dropdown>
        <div className={styles.SearchBox}>
          <SearchInput onPressEnter={handlePressEnter} onClear={handleClear} onChange={handleFilterNameChange} />
          <span className={styles.totalImages}>
            {totalImagesLength} {`file${totalImagesLength > 1 ? "s" : ""}`}
          </span>
        </div>

        <div className={styles.Fill} />
        {isRunning ? <Button loading label="Running" disabled type="primary" /> : null}
        {(selectedImages.length > 0 || isDownloading) && (
          <HLayout noPadding={true} noFlex={true} gap={24} style={{ marginLeft: 16 }}>
            <PrimaryButton
              icon={isDownloading ? null : <IconDownload />}
              label={downloadText}
              onClick={() => {
                // if (downloadAll && selectedImages?.length >= DOWNLOAD_LIMIT) {
                //   setShowDownloadAllModal(true);
                // } else {
                //   ;
                // }
                onDownload();
              }}
              loading={isDownloading}
              className={classNames({
                [styles.downloadingButton]: isDownloading
              })}
            />
          </HLayout>
        )}
      </div>
      {isRunning && images?.length === 0 ? (
        <div className={styles.inProgressWrapper}>
          <div className={styles.inProgressContainer}>
            <div className={styles.projectSkeleton}>
              <Spin
                className={styles.Spinner}
                indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
              />
              <span className={styles.Progress} />
            </div>
            <span className={styles.inProgressTitle}>{t("summary.automation_running.title")}</span>
            <span className={styles.inProgressText}>{t("summary.automation_running.desc")}</span>
          </div>
        </div>
      ) : null}
      {images?.length > 0 && isLoaded ? (
        <div ref={galleryRef} className={classNames(styles.CardList)} onScroll={galleryScrollListener}>
          <Row gutter={[32, 24]}>
            {images.map((image, index) => (
              <Col key={index} sm={8} md={8} lg={6} xl={6} xxl={4}>
                <LazyLoad once overflow throttle={100} height={200}>
                  <MediaCard
                    image={image}
                    isSelected={!!selectedImages.find(imageId => imageId === image.id)}
                    onSelect={handleSelectImage}
                    onDownload={onSingleCardDownload}
                  />
                </LazyLoad>
              </Col>
            ))}
          </Row>
        </div>
      ) : null}
      {nextPageLoading ? (
        <Row justify="center" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
          <Col>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />} />
          </Col>
        </Row>
      ) : null}
      {images?.length === 0 && !isLoaded && !isRunning ? (
        <div className={styles.inProgressWrapper}>
          <div className={styles.projectSkeleton}>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            <span className={styles.Progress} />
          </div>
        </div>
      ) : null}
      {images?.length === 0 && isLoaded && !isRunning ? (
        <div className={styles.noResult}>{t("upload.no_search_result")}</div>
      ) : null}
      <CustomModal
        title={t("summary.download_all_modal.title", { count: totalDownloadCount })}
        okText={t("summary.download_all_modal.ok_text")}
        cancelText={t("summary.download_all_modal.cancel_text")}
        visible={showDownloadAllModal}
        onOk={() => {
          onDownload();
          setShowDownloadAllModal(false);
        }}
        onCancel={() => setShowDownloadAllModal(false)}
        type="primary"
      >
        <p className={styles.DeleteModalContent}>{t("summary.download_all_modal.desc")}</p>
      </CustomModal>
    </>
  );
}

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  automationStatus: state.smartcrop.smartCropStatus,
  images: state.smartcrop.resultsImages,
  downloadAll: state.smartcrop.downloadAll
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateDownloadAll: (downloadAll: boolean) => dispatch(updateDownloadAll(downloadAll))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(MediaGallery);
