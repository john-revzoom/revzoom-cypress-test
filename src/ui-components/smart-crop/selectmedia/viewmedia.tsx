import styles from "../../../styles/UploadMedia.module.css";
import { Button } from "../../../ui-components/components/button";
import { Progress } from "../../../ui-components/components/progress";
import { MediaGallery } from "../../../ui-components/components/media-gallery";
import DeleteIcon from "../../../../public/images/delete.svg";
import { UploadController } from "../../../controller/UploadController";
import { useMemo, useRef, useState } from "react";
import { UPLOAD_STATUS } from "../../../common/Enums";
import { CustomModal } from "../../../ui-components/components/modal";
import { UploadingPhoto } from "../../../common/Types";
import { cancelUploading } from "../../../util/upload-media/file-uploader";
import { ActiveOptionProps } from "../../../ui-components/components/project-card/project-card";
import { useTranslation } from "react-i18next";
import { toast } from "../../components/toast";
import { Button as AntButton } from "antd";
import AutomationAssetListController from "../../../controller/AutomationAssetListController";
import AssetsView from "../../../controller/AssetsView";

type ViewMediaProps = {
  uploadController: UploadController;
  uploadFiles: (fileList: FileList) => void;
  assetsView: AssetsView;
};

const ViewMedia = (props: ViewMediaProps) => {
  const uploadController = props.uploadController;
  const assetsView = props.assetsView;
  const [selectedImgs, updateSelectedImgs] = useState<string[]>([]);
  const [ignoredForDelete, updateIgnoredForDelete] = useState<string[]>([]);
  const [visibleDeleteModal, toggleDeleteModal] = useState(false);
  const [modalName, setModalName] = useState<string | undefined>();
  const [isSelectAll, setSelectALL] = useState<boolean>(false);
  const [nextPageLoaded, setNextPageLoaded] = useState(false);
  const { t } = useTranslation();

  const getPercent = () => {
    const total = uploadController.getTotal();
    const uploadedFilesCount = uploadController.getFinishedCount();
    return Math.floor((uploadedFilesCount / total) * 100);
  };

  let images: UploadingPhoto[] = [];
  const setImagesForUI = () => {
    const files = assetsView.getFiles();
    images = files.map((uploadItem, ix) => {
      const file = uploadItem.getFile();
      let image: UploadingPhoto = {
        name: uploadItem.getName(),
        percent: uploadItem.getUploadProgress(),
        size: file ? uploadItem.getFile()?.size : uploadItem.getSize(),
        lastModified: uploadItem.getFile()?.lastModified,
        id: uploadItem.getUiId(),
        thumbnailUrl: "",
        file: file,
        isUploading: true,
        isThumbGenerated: uploadItem.isThumbGenerated(),
        assetId: uploadItem.getId()
      };
      if (uploadItem.getStatus() === UPLOAD_STATUS.FINISHED && uploadItem.getThumbnailUrl()) {
        image.thumbnailUrl = uploadItem.getThumbnailUrl();
        delete image.isUploading;
      }
      return image;
    });
    return images;
  };

  setImagesForUI();

  const modalContent: ActiveOptionProps = useMemo(() => {
    switch (modalName) {
      case "delete":
        //Todo: i18n not here. @achin.
        let title = `Are you sure you want to delete these ${
          isSelectAll ? assetsView.getTotal() - ignoredForDelete.length : selectedImgs.length
        } assets?`;
        let okText = `Delete ${
          isSelectAll ? assetsView.getTotal() - ignoredForDelete.length : selectedImgs.length
        } assets`;
        return {
          title: title,
          okText: okText,
          cancelText: t("upload.cancel_upload_cancel_button_text"),
          type: "danger",
          onOk: () => {
            assetsView.delete(selectedImgs, isSelectAll, ignoredForDelete);
            updateSelectedImgs([]);
            if (isSelectAll) {
              updateIgnoredForDelete([]);
              setSelectALL(false);
            }

            toggleDeleteModal(false);
          }
        };

      case "singleDelete":
        return {
          title: t("asset.confirm_delete"),
          okText: t("asset.delete"),
          cancelText: t("asset.do_not_delete"),
          type: "danger",
          onOk: () => {
            assetsView.delete([selectedImgs[0]], false, []);
            updateSelectedImgs([]);
            toggleDeleteModal(false);
          }
        };

      case "cancel":
        return {
          title: t("upload.confirm_upload_cancel"),
          okText: t("upload.cancel_upload_ok_button_text"),
          cancelText: t("upload.cancel_upload_cancel_button_text"),
          type: "danger",
          onOk: () => {
            uploadController.delete([], true, []);
            toggleDeleteModal(false);
          }
        };
      default: {
        return {
          title: "",
          okText: "",
          cancelText: "",
          onOk: () => {},
          type: "default",
          body: <div>Something went wrong</div>
        };
      }
    }
  }, [modalName, selectedImgs, visibleDeleteModal, isSelectAll]);

  const onDelete = () => {
    setModalName("delete");
    toggleDeleteModal(true);
  };

  const onCancelUpload = () => {
    setModalName("cancel");
    toggleDeleteModal(true);
  };

  const onSingleAssetDelete = (imgId: string) => {
    updateSelectedImgs([imgId]);
    setModalName("singleDelete");
    toggleDeleteModal(true);
  };

  const getNextPage = () => {
    return new Promise((resolve, reject) => {
      assetsView.loadNextPage().then(result => {
        if (isSelectAll) setNextPageLoaded(true);
        resolve(result);
      });
    });
  };

  return (
    <div className={styles.ViewMediaWrapper}>
      <div className={styles.Header}>
        {!uploadController.isRunning() && (
          <>
            <span className={styles.TotalFiles}>
              {assetsView.getTotal()} {assetsView.getTotal() === 1 ? "file" : "files"}
            </span>
          </>
        )}
        {uploadController.isRunning() && (
          <>
            <span className={styles.TotalFiles}>
              {assetsView.getTotal()} {assetsView.getTotal() === 1 ? "file" : "files"} uploading
            </span>
            <span className={styles.Progress}>{getPercent()}%</span>
            <Progress className={styles.ProgressBar} percent={getPercent()} />
            <span className={styles.ProgressOverview}>
              {uploadController.getFinishedCount()}/{assetsView.getTotal()}
            </span>
            <Button size="sm" icon={<DeleteIcon />} type="text" onClick={onCancelUpload} />
          </>
        )}
      </div>
      <MediaGallery
        images={images}
        selected={selectedImgs}
        onSelectionChanged={updateSelectedImgs}
        ignoredForDelete={ignoredForDelete}
        onIgnoredForDelete={updateIgnoredForDelete}
        onDeletion={onSingleAssetDelete}
        totalUploadedCardsLength={assetsView.getTotal()}
        getNewUploadedPage={getNextPage}
        setSelectAll={setSelectALL}
        nextPageLoaded={nextPageLoaded}
        setNextPageLoaded={setNextPageLoaded}
        searchAssets={(searchText: string) => {
          updateSelectedImgs([]);
          setSelectALL(false);
          return assetsView.search(searchText);
        }}
        action={
          <Button
            type="text"
            icon={<DeleteIcon />}
            label={`Delete ${isSelectAll ? assetsView.getTotal() - ignoredForDelete.length : selectedImgs.length}`}
            onClick={onDelete}
          />
        }
        uploadFiles={props.uploadFiles}
      />

      <CustomModal
        title={`${modalContent.title}`}
        okText={modalContent.okText}
        cancelText={modalContent.cancelText}
        disableOk={modalContent.disableOk}
        visible={visibleDeleteModal}
        onOk={modalContent.onOk}
        onCancel={() => toggleDeleteModal(false)}
        type={"danger"}
      >
        <p className={styles.DeleteModalContent}>You can not undo this action.</p>
      </CustomModal>
    </div>
  );
};

export default ViewMedia;
