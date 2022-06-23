// @ts-nocheck
import { useRef } from "react";
import { DraggerProps } from "antd/lib/upload";
import { Button } from "../../../ui-components/components/button";
import { Upload, message } from "antd";
import "antd/dist/antd.css";
import styles from "../../../styles/UploadMedia.module.css";
import Image from "next/image";
import ViewMedia from "./viewmedia";
import { useTranslation } from "react-i18next";
import AssetsView from "../../../controller/AssetsView";
import { UploadController } from "../../../controller/UploadController";

const acceptUpload = ".png, .jpg, .jpeg, .GIF,.WEBP";

export type UploadMediaProps = {
  /**
   * Method for upload  the files
   */
  uploadFiles: (filesList: FileList) => void;
  className?: string;
  isGallery?: boolean;
  assetsView: AssetsView;
  uploadController: UploadController;
};

const UploadMedia = (uploadMediaProps: UploadMediaProps) => {
  const { uploadFiles, className, isGallery, assetsView } = uploadMediaProps;
  const { t } = useTranslation();
  const { Dragger } = Upload;
  const fileUploaderRef = useRef<HTMLInputElement>(null);
  const propsForDragger: DraggerProps = {
    className: "test",
    accept: acceptUpload,
    name: "file",
    showUploadList: false,
    multiple: true,
    action: "",
    beforeUpload: () => {
      return false;
    },
    onDrop(e) {
      console.log("upload button onDrop");
      uploadFiles(e.dataTransfer.files);
    },
    style: isGallery
      ? {
          cursor: "auto",
          border: "none"
          // marginTop: "-1rem"
        }
      : {
          background: "#EFF1F3",
          cursor: "auto",
          border: "none"
        },
    openFileDialogOnClick: false
  };

  const onFileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  return (
    <div className={!isGallery ? styles.DraggerWrapper : styles.GalleryDraggerWrapper}>
      <Dragger {...propsForDragger}>
        {!isGallery && (
          <>
            <div className={styles.uploadMedia_draggerDiv}>
              <p className="ant-upload-drag-icon">
                <Image src="/images/upload-media.svg" height={204} width={204} />
              </p>
              <div className={styles.uploadMedia_dragAndDropText}>
                <span>{t("upload.drag_and_dropped.title")}</span>
              </div>
              <div className={styles.uploadMedia_dragAndDropText2}>
                <span>{t("upload.drag_and_dropped.subtitle")}</span>
              </div>
              <div className={styles.uploadMedia_dragAndDropText3}>
                <span>
                  {t("upload.drag_and_dropped.desc_1")}
                  <br />
                  {t("upload.drag_and_dropped.desc_2")}
                </span>
              </div>
            </div>
            <div className={styles.uploadButtonDiv}>
              <input
                ref={fileUploaderRef}
                type="file"
                onChange={onFileChanged}
                multiple
                accept={acceptUpload}
                className={styles.FileUploadButton}
                data-cy="uploadMediaInput"
              />
              <Button
                className={styles.uploadButton}
                label={t("upload.select_from_device")}
                icon={<Image src="/images/upload_outlined@1x.svg" height={16.6} width={16.6} />}
                onClick={() => fileUploaderRef.current?.click()}
              />
            </div>
          </>
        )}
        {isGallery && (
          <ViewMedia
            assetsView={uploadMediaProps.assetsView}
            uploadController={uploadMediaProps.uploadController}
            uploadFiles={uploadFiles}
          />
        )}
      </Dragger>
    </div>
  );
};

export default UploadMedia;
