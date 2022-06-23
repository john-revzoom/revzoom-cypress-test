import { connect, ConnectedProps } from "react-redux";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { MediaGallery } from "../media-gallery-v2";
import styles from "./smartcrop-summary.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOMATION_STATUS, JOB_STATUS } from "../../../common/Enums";
import SmartcropNavbar from "../smartcrop-navbar/smartcrop-navbar";
import SmartcropLeftpanel from "../smartcrop-leftpanel/smartcrop-leftpanel";
import API from "../../../util/web/api";
import { Logger } from "aws-amplify";
import {
  addCroppedImages,
  updateAutomationJob,
  updateLargePreview,
  updateSmartCropStatus,
  updateView
} from "../../../redux/actions/smartcropActions";
import { Dispatch } from "redux";
import CroppedDataSummaryResponse from "../../../models/CroppedDataSummaryResponse";
import { JSON_TYPE, Photo } from "../../../common/Types";
import SmartCroppedAssetsResultsResponse, {
  SmartCroppedAssetsNextPageToken
} from "../../../models/SmartCroppedAssetsResultsResponse";
import { useRouter } from "next/router";
import AutomationJob from "../../../models/AutomationJob";
import DownloadImageResponse, { DownloadImageToken, DownloadMedia } from "../../../models/DownloadImageResponse";
import DownloadStatusResponse from "../../../models/DownloadStatusResponse";
import Optional from "../../../util/Optional";
import { toast } from "../toast";
import { getAutomationConfig } from "../smart-crop-config/smart-crop.service";
import LargePreview from "../large-preview";
import { useIntercom } from "react-use-intercom";
import { CustomModal } from "../modal";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { onBeforePopState } from "../../../util/router/routerUtil";
import moment from "moment";
import {
  AUTO_REFRESH_INTERVAL_TIME,
  DOWNLOAD_INTERVAL_TIME,
  DOWNLOAD_LIMIT,
  TIME_AMOUNT,
  TIME_UNIT
} from "../../../util/summary-helpers";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface SmartCropSummaryProps extends PropsFromRedux {
  automationId: string;
}

const logger = new Logger("ui-components:components:smartcrop-summary");

const SmartCropSummary = ({
  latestJobId,
  addCroppedImages,
  resultImages,
  updateCurrentView,
  automationStatus,
  updateAutomationStatus,
  updateAutomationJob,
  automationJob,
  largePreview,
  updateLargePreview,
  automationName,
  downloadAll
}: SmartCropSummaryProps) => {
  const [selectedImages, updateSelectedImages] = useState<string[]>([]);
  const [isDownloadingMedia, setIsDownloadingMedia] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [isZipFileReady, setIsZipFileReady] = useState<boolean>(false);
  const [totalImages, setTotalImages] = useState(0);
  const [excludedCroppedIds, setExcludedCropIds] = useState<string[] | null>(null);
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);
  const [runningDownloads, setRunningDownloads] = useLocalStorage<Array<any>>("downloads", []);
  const router = useRouter();
  const automationStatusRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<any>();
  const downloadTimerRef = useRef<any>();
  const downloadStatusRef = useRef<any>();
  const downloadIdRef = useRef<string>();
  const downloadCountRef = useRef<number>();
  const zipFileRef = useRef<DownloadMedia | null>(null);
  const refreshNextPageLimit = useRef<number | null>(20);
  const nextPageTokenRef = useRef<SmartCroppedAssetsNextPageToken | null>(null);
  const { t } = useTranslation();

  const { update: updateIntercom } = useIntercom();
  const automationId = router?.query?.automationId as string;

  useEffect(() => {
    updateIntercom({
      verticalPadding: !!largePreview ? 70 : 30
    });
    if (!!largePreview) {
      const backUrl = `/smart-crop?automationId=${router?.query?.automationId}`;
      onBeforePopState(router, backUrl, () => updateLargePreview(undefined));
    }
    return () => {
      router.beforePopState(() => {
        return true;
      });
    };
  }, [router, largePreview, automationId]);

  useEffect(() => {
    if (automationStatus) {
      automationStatusRef.current = automationStatus;
    }
  }, [automationStatus]);

  const { trackEvent } = useIntercom();

  useEffect(() => {
    if (latestJobId) {
      handleGetSummaryFirstPageResults();
    }
    return () => {
      stopAutoRefresh();
      stopDownloadRefresh();
      automationStatusRef.current = null;
      downloadStatusRef.current = null;
      downloadIdRef.current = "";
      zipFileRef.current = null;
      refreshNextPageLimit.current = null;
      nextPageTokenRef.current = null;
      updateSelectedImages([]);
      setIsDownloadingMedia(false);
      setIsDownloadingZip(false);
      setTotalImages(0);
      setHasDataLoaded(false);
      updateAutomationStatus("");
    };
  }, [latestJobId, automationId]);

  useEffect(() => {
    if (!!resultImages && !!selectedImages && downloadAll) {
      const excludedCropIds: string[] = resultImages?.map(resultImg => {
        if (!resultImg.errorCode && !selectedImages.find(image => image === resultImg.id)) {
          return resultImg.id as string;
        }
        return "";
      });
      if (!!excludedCropIds && excludedCropIds.length > 0) {
        const filtered = excludedCropIds.filter(id => id !== "");
        setExcludedCropIds(filtered);
      } else {
        setExcludedCropIds(null);
      }
    }
  }, [selectedImages, resultImages, downloadAll]);

  function stopDownloadRefresh() {
    logger.debug("Stopped setupDownloadRefresh.");
    clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = null;
  }

  const setupDownloadRefresh = () => {
    stopDownloadRefresh();
    logger.debug("calling setupDownloadRefresh", downloadStatusRef.current);
    if (downloadStatusRef.current !== JOB_STATUS.SUCCEEDED && downloadStatusRef.current !== JOB_STATUS.FAILED) {
      logger.debug("Scheduled timer to check download zip status after: ", DOWNLOAD_INTERVAL_TIME);
      downloadTimerRef.current = setTimeout(handleGetDownloadStatus, DOWNLOAD_INTERVAL_TIME);
    }
  };

  function stopAutoRefresh() {
    logger.debug("Stopped auto refresh of results.");
    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = null;
  }

  const setupAutoRefresh = () => {
    stopAutoRefresh();
    logger.debug("calling setupAutoRefresh with status", automationStatusRef.current);
    if (automationStatusRef.current === AUTOMATION_STATUS.RUNNING) {
      logger.debug("Scheduled timer to auto refresh the results after: ", AUTO_REFRESH_INTERVAL_TIME);
      refreshTimerRef.current = setTimeout(handleGetSummaryFirstPageResults, AUTO_REFRESH_INTERVAL_TIME);
    }
  };

  const downloadMediaToLocal = async (s3Files: Array<DownloadMedia>) => {
    if (s3Files.length > 0) {
      downloadFiles(s3Files);
    }
  };

  const handleGetDownloadStatus = () => {
    logger.debug("calling handleGetDownloadStatus");
    if (!!automationId && !!automationName) {
      const details = {
        automation_id: automationId,
        automation_name: automationName
      };
      API.getSmartCropDownloadStatus(latestJobId, downloadIdRef?.current as string, details)
        .then((response: Optional<DownloadStatusResponse>) => {
          const zippedFile = response.get().getZippedMedia();
          const status = zippedFile.jobStatus;
          downloadStatusRef.current = status;

          if (status === JOB_STATUS.SUCCEEDED) {
            setIsDownloadingZip(false);
            setIsZipFileReady(true);
            zipFileRef.current = zippedFile;
          }
          if (status === JOB_STATUS.FAILED) {
            setIsDownloadingZip(false);
            updateRunningDownloads();
            toast("Download failed!", "error");
          }
        })
        .catch(e => {
          setIsDownloadingZip(false);
          updateRunningDownloads();
          logger.error("handleGetDownloadStatus error", e);
          toast(e?.message ?? e?.toString(), "error");
        })
        .finally(() => {
          setupDownloadRefresh();
        });
    }
  };

  const onDownloadFromS3 = async (downloadToken: DownloadImageToken) => {
    if (selectedImages?.length > 0 && selectedImages.length < DOWNLOAD_LIMIT) {
      setIsDownloadingMedia(true);
      return API.downloadSmartCroppedImages(latestJobId, downloadToken);
    }
    if (selectedImages.length >= DOWNLOAD_LIMIT) {
      setIsDownloadingZip(true);
      return API.downloadSmartCroppedImages(latestJobId, downloadToken);
    }
  };

  const handleSingleCardDownload = useCallback(
    (downloadToken: DownloadImageToken) => {
      API.downloadSmartCroppedImages(latestJobId, downloadToken)
        .then((response: Optional<DownloadImageResponse>) => {
          const s3Response = response.get();
          const media = s3Response.getS3DownloadedMedia();
          downloadMediaToLocal([media]);
        })
        .catch(e => {
          setIsDownloadingMedia(false);
          logger.error("onDownload error", e);
          toast(e?.detail ?? e?.toString(), "error");
        });
    },
    [latestJobId]
  );

  function downloadFiles(files: Array<JSON_TYPE>) {
    function downloadNext(i: number) {
      if (i >= files.length) {
        if (zipFileRef.current) {
          zipFileRef.current = null;
        }
        setIsDownloadingMedia(false);
        return;
      }
      window.open(files[i].s3DownloadSignedUrl, "_parent");
      setTimeout(function () {
        downloadNext(i + 1);
      }, 1000);
    }
    // Initiate the first download.
    downloadNext(0);
  }

  const convertPhotosFromCroppedImages = (images: CroppedDataSummaryResponse[]) => {
    return images.map((image: CroppedDataSummaryResponse) => {
      const newImage: Photo = {
        id: image.cropId,
        name: image.cropName,
        thumbnailUrl: image.croppedOutputThumbSignedUrl,
        size: image.cropSize,
        isoDate: image.isoDate.toDate(),
        imageUrl: image.croppedOutputPreviewSignedUrl,
        errorCode: image?.errorCode || "",
        dimension: image.cropImageDimensions,
        cropConfigName: image.getCropConfigEnum()
      };
      return newImage;
    });
  };

  const handleGetSummaryFirstPageResults = () => {
    updateCurrentView("summary");
    API.getSmartCropJobResults(latestJobId, refreshNextPageLimit.current || 20)
      .then(response => {
        logger.debug("getSmartCropJobResults response", response);
        const images = response.get().croppedDataSummaries;
        const total = response.get().total;
        const nextPage = response.get().nextPageToken;
        const croppedImages = convertPhotosFromCroppedImages(images);
        if (total > 0) {
          setTotalImages(total);
          addCroppedImages(croppedImages);
          nextPageTokenRef.current = nextPage;
        }

        if (!!runningDownloads && runningDownloads?.length > 0) {
          const currentRunningDownload = runningDownloads.find(download => download.automationId === automationId);
          if (!!currentRunningDownload) {
            //check if expireAt value is the same or before the set expiration time of the selected running download
            const isDownloadValid =
              currentRunningDownload?.expireAt && moment().isSameOrBefore(moment(currentRunningDownload.expireAt));
            if (isDownloadValid) {
              stopDownloadRefresh();
              setIsDownloadingZip(true);
              downloadIdRef.current = currentRunningDownload.downloadId;
              downloadCountRef.current = currentRunningDownload.downloadCount;
              handleGetDownloadStatus();
            } else {
              updateRunningDownloads();
            }
          }
        }

        return getAutomationConfig(automationId, false, false)
          .then(response => {
            const automationResponse = response.get();
            const automation = automationResponse.getAutomationDetails();
            const newStatus = automation?.getStatus() as string;
            logger.debug(`getSmartCropJobResults new status`, newStatus);
            updateAutomationStatus(newStatus);
            if (automation?.isCompleted()) {
              refreshNextPageLimit.current = 20;
              logger.info("automation is now completed");
              trackEvent("crop-automation-completed");
            }
            if (!automationJob.hasAutomationDetails) {
              const assetIds: number[] = images.map(image => Number(image.asset_id));
              return API.getAutomationJob(automationId, latestJobId, [...assetIds]).then(response => {
                if (response?.isPresent()) {
                  const newAutomationJob = response.get();
                  updateAutomationJob(newAutomationJob);
                }
              });
            }
          })
          .catch(e => {
            logger.error("getAutomationConfig error in summary page", e);
          });
      })
      .catch((error: any) => {
        logger.error(`getSmartCropJobResults error`, error);
      })
      .finally(() => {
        logger.debug(`getAutomationConfig finally`, automationStatusRef.current);
        setHasDataLoaded(true);
        setupAutoRefresh();
      });
  };

  const processSummaryResults = (response: Optional<SmartCroppedAssetsResultsResponse>) => {
    return new Promise((resolve, reject) => {
      const images = response.get().croppedDataSummaries;
      nextPageTokenRef.current = response.get().nextPageToken;
      const nextPageCroppedImages = convertPhotosFromCroppedImages(images);
      const newResultImages = [...resultImages, ...nextPageCroppedImages];
      refreshNextPageLimit.current = newResultImages.length;
      addCroppedImages(newResultImages);
      resolve([images, nextPageCroppedImages]);
    });
  };

  const getNextPageSummaryResults = () => {
    logger.debug("getNextPageSummaryResults nextPage", latestJobId, nextPageTokenRef.current);
    stopAutoRefresh();
    API.getSmartCropJobResults(latestJobId, 20, nextPageTokenRef.current)
      .then(async response => {
        logger.debug("getNextPageSummaryResults response", response);
        const [images]: any = await processSummaryResults(response);

        if (automationStatus === AUTOMATION_STATUS.RUNNING) {
          return getAutomationConfig(automationId, false, false)
            .then(response => {
              const automationResponse = response.get();
              const automation = automationResponse.getAutomationDetails();
              const newStatus = automation?.getStatus() as string;
              logger.debug(`getSmartCropJobResults new status`, newStatus);
              updateAutomationStatus(newStatus);
              if (automation?.isCompleted()) {
                logger.info("automation is now completed");
                trackEvent("crop-automation-completed");
              }
              if (!automationJob.hasAutomationDetails) {
                const assetIds: number[] = images.map((image: any) => Number(image.asset_id));
                return API.getAutomationJob(automationId, latestJobId, [...assetIds]).then(response => {
                  if (response?.isPresent()) {
                    const newAutomationJob = response.get();
                    updateAutomationJob(newAutomationJob);
                  }
                });
              }
            })
            .catch(e => {
              logger.error("getAutomationConfig error in summary page", e);
            });
        }
      })
      .catch((error: any) => {
        logger.error(`getNextPageSummaryResults error`, error);
      })
      .finally(() => {
        setupAutoRefresh();
      });
  };

  const downloadZipFile = useCallback(() => {
    if (zipFileRef?.current) {
      downloadMediaToLocal([zipFileRef.current]);
      updateRunningDownloads();
    }
    setIsZipFileReady(false);
  }, [zipFileRef]);

  const handleDownload = useCallback(() => {
    //only triggers when
    //selected images > 0 and < download limit
    //regardless if downloadAll is true or false
    if (selectedImages?.length > 0 && selectedImages.length < DOWNLOAD_LIMIT) {
      Promise.all([
        ...selectedImages.map(async id => {
          const downloadToken = new DownloadImageToken();
          downloadToken.automation_id = router?.query?.automationId as string;
          downloadToken.crop_ids = [id];
          downloadToken.download_all = false;
          return onDownloadFromS3(downloadToken);
        })
      ])
        .then((responses: any) => {
          return Promise.all(
            responses.map((response: Optional<DownloadImageResponse>) => {
              const s3Response = response.get();
              const media = s3Response.getS3DownloadedMedia();
              return media;
            })
          );
        })
        .then(async (data: any) => {
          let allDownloadMedia: Array<DownloadMedia> = [];
          data.forEach((media: DownloadMedia) => {
            allDownloadMedia.push(media);
          });
          downloadMediaToLocal(allDownloadMedia);
        })
        .catch(e => {
          setIsDownloadingMedia(false);
          logger.error("onDownload error", e);
          toast(e?.detail ?? e?.toString(), "error");
        });
    }

    //only triggers when
    //download all is selected and total images is > 20
    //download all is selected and unchecked all first 20
    if (selectedImages.length >= DOWNLOAD_LIMIT) {
      const downloadToken = new DownloadImageToken();
      downloadToken.automation_id = router?.query?.automationId as string;
      downloadToken.automation_name = automationName;
      downloadToken.download_all = downloadAll;

      if (downloadAll && !!excludedCroppedIds && excludedCroppedIds?.length > 0) {
        downloadToken.excluded_crop_ids = excludedCroppedIds;
      }

      if (!downloadAll) {
        downloadToken.crop_ids = selectedImages;
      }

      logger.debug("downloadToken", downloadToken);
      onDownloadFromS3(downloadToken)
        .then(response => {
          const s3Response = response?.get();
          const media = s3Response?.getS3DownloadedMedia();
          if (!!media) {
            downloadIdRef.current = media.downloadId;
            downloadStatusRef.current = media.jobStatus;

            const downloadCount =
              downloadAll && (!excludedCroppedIds || excludedCroppedIds?.length === 0)
                ? totalImages
                : downloadAll && !!excludedCroppedIds && excludedCroppedIds?.length > 0
                ? totalImages - excludedCroppedIds.length
                : selectedImages.length;
            downloadCountRef.current = downloadCount;

            setRunningDownloads([
              ...runningDownloads,
              {
                automationId,
                downloadId: media.downloadId,
                downloadCount,
                expireAt: moment().add(TIME_AMOUNT, TIME_UNIT)
              }
            ]);
          }
        })
        .catch(e => {
          setIsDownloadingZip(false);
          updateRunningDownloads();
          downloadStatusRef.current = JOB_STATUS.FAILED;
          logger.error("onDownloadFromS3 error", e);
          toast(e?.detail ?? e?.toString(), "error");
        })
        .finally(() => {
          setupDownloadRefresh();
        });
    }
  }, [selectedImages, downloadAll, excludedCroppedIds]);

  const updateRunningDownloads = () => {
    const newRunningDownloads =
      runningDownloads.length > 1 ? runningDownloads.filter(download => download.automationId !== automationId) : [];
    setRunningDownloads(newRunningDownloads);
  };

  const handleSelectImages = useCallback((selections: string[]) => {
    updateSelectedImages(selections ? selections.filter(v => v != null) : []);
  }, []);

  const getNextPage = async () => {
    return await getNextPageSummaryResults();
  };

  const handleSearch = useCallback((searchText: string) => {
    updateSelectedImages([]);
  }, []);

  const handleNextLargePreview = () => {
    if (largePreview) {
      const currentIndex = resultImages.findIndex(image => image?.id === largePreview?.id);
      const nextIndex = currentIndex + 1;
      if (nextIndex <= resultImages.length - 1) {
        const image = resultImages[nextIndex];
        const data = {
          id: image?.id,
          url: image.imageUrl,
          name: image.name
        };
        updateLargePreview(data);
      } else {
        logger.debug("handleNextLargePreview", latestJobId, nextPageTokenRef.current);
        API.getSmartCropJobResults(latestJobId, 20, nextPageTokenRef.current).then(async response => {
          logger.debug("handleNextLargePreview getNextPageSummaryResults response", response);
          const [, photos]: any = await processSummaryResults(response);
          const nextLargePreview: any = photos[0];
          logger.debug("handleNextLargePreview nextLargePreview", nextLargePreview);
          updateLargePreview({
            id: nextLargePreview?.id,
            url: nextLargePreview.imageUrl,
            name: nextLargePreview.name
          });
        });
      }
    }
  };
  const handlePreviousLargePreview = () => {
    if (largePreview) {
      const currentIndex = resultImages.findIndex(image => image?.id === largePreview?.id);
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const image = resultImages[prevIndex];
        const data = {
          id: image?.id,
          url: image.imageUrl,
          name: image.name
        };
        updateLargePreview(data);
      }
    }
  };

  const handleCancelDownload = useCallback(() => {
    if (zipFileRef.current) {
      zipFileRef.current = null;
    }
    updateRunningDownloads();
    setIsZipFileReady(false);
  }, [zipFileRef]);
  console.log("totalImages", totalImages, downloadAll && !excludedCroppedIds);

  return (
    <>
      <SmartcropNavbar />
      <div style={{ display: "flex", position: "relative" }}>
        {largePreview && (
          <div className={styles.LargePreviewWrapper}>
            <LargePreview
              largePreview={largePreview}
              isFirstItem={largePreview?.id === resultImages[0]?.id}
              isLastItem={largePreview?.id === resultImages[totalImages - 1]?.id}
              onNextImage={handleNextLargePreview}
              onPreviousImage={handlePreviousLargePreview}
            />
          </div>
        )}
        {/* <SmartcropLeftpanel /> */}
        <div className={styles.Wrapper}>
          <MediaGallery
            isDownloading={isDownloadingMedia || isDownloadingZip}
            downloadText={
              isDownloadingMedia
                ? t("summary.download.downloading")
                : isDownloadingZip
                ? t("summary.download.generating_zip_file")
                : t("summary.download.download_with_count", {
                    count: downloadCountRef.current || selectedImages?.length
                  })
            }
            onDownload={handleDownload}
            isLoaded={hasDataLoaded}
            selectedImages={selectedImages}
            className={styles.MediaGallery}
            onSelectChange={handleSelectImages}
            onSearchImages={handleSearch}
            onSelectImages={handleSelectImages}
            onClearSearch={handleSearch}
            totalImagesLength={totalImages}
            currentImagesLength={resultImages?.length}
            totalDownloadCount={!!excludedCroppedIds ? totalImages - excludedCroppedIds.length : 0}
            getNextResultsPage={getNextPage}
            onSingleCardDownload={handleSingleCardDownload}
          />
          <CustomModal
            title={t("summary.zip_modal.title")}
            visible={isZipFileReady}
            okText={t("summary.zip_modal.download")}
            cancelText={t("summary.zip_modal.cancel")}
            type="primary"
            onOk={downloadZipFile}
            buttonLoading={isDownloadingMedia}
            onCancel={handleCancelDownload}
          >
            <p className={styles.DownloadText}>
              {t("summary.download.download_desc", { count: downloadCountRef?.current })}
            </p>
          </CustomModal>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  resultImages: state.smartcrop.resultsImages,
  latestJobId: state.smartcrop.latestJobId,
  automationStatus: state.smartcrop.smartCropStatus,
  automationName: state.smartcrop.automationName,
  automationJob: state.smartcrop.automationJob,
  largePreview: state.smartcrop.largePreview,
  downloadAll: state.smartcrop.downloadAll
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addCroppedImages: (images: Photo[]) => dispatch(addCroppedImages(images)),
  updateCurrentView: (view: string) => dispatch(updateView(view)),
  updateAutomationStatus: (status: string) => dispatch(updateSmartCropStatus(status)),
  updateAutomationJob: (job: AutomationJob) => dispatch(updateAutomationJob(job)),
  updateLargePreview: (data: JSON_TYPE | undefined) => dispatch(updateLargePreview(data))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropSummary);
