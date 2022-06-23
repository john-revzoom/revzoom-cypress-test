import moment from "moment";
import { useTranslation } from "react-i18next";
import { Banner } from "../../banner/banner";
import { Button } from "../../button";
import ProgressFileloader from "../../progress-fileloader/progress-fileloader";
import { ShowMarkerToggle } from "../../showmarker-toggle";
import IconEdit from "../../../assets/icons/icon-pencil.svg";
import IconFavorite from "../../../assets/icons/icon-star.svg";
import styles from "../smartcrop-leftpanel.module.scss";
import { Divider } from "../../divider";
import { useCallback, useMemo, useState } from "react";
import { CustomModal } from "../../modal";
import { DuplicateModalContent, RenameModalContent } from "../../project-card/modal-content";
import { OBJECT_TYPE } from "../../../../common/Types";
import { LegacyButtonType } from "antd/lib/button/button";
import { ActiveOptionProps, IduplicateCheckBox } from "../../project-card/project-card";
import { toast } from "../../toast";
import API from "../../../../util/web/api";
import { useRouter } from "next/router";
// import { PreviewToggle } from "../../preview-toggle";

interface SmartCropViewProps {
  currentView: string;
  showBanner: boolean;
  isFinished: boolean;
  completedDate: Date;
  onToggleBanner: Function;
  automationName: string;
}

export default function SmartCropView({
  currentView,
  showBanner,
  isFinished,
  completedDate,
  onToggleBanner,
  automationName
}: SmartCropViewProps) {
  const { t } = useTranslation();
  const [showSmartCropModal, setShowSmartCropModal] = useState<boolean>(false);
  const [selectedModalType, setSelectedModalType] = useState<string>("");
  const [newAutomationName, setNewAutomationName] = useState<string>("");
  const [duplicateConfig, setDuplicateConfig] = useState<IduplicateCheckBox>({
    duplicate_configuration: false,
    duplicate_media: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const automationId = router?.query?.automationId as string;

  // if (currentView === "smartcrop") {
  //   return (
  //     <>
  //       {showBanner && !isFinished && (
  //         <Banner
  //           className={styles.Banner}
  //           message={t("in_progress.left_panel.tip.title")}
  //           description={t("in_progress.left_panel.tip.desc")}
  //           closable={true}
  //           onClose={() => onToggleBanner(false)}
  //         />
  //       )}
  //       <PreviewToggle />
  //       <ShowMarkerToggle className={styles.Section} />
  //       <ProgressFileloader />
  //       <Divider />
  //     </>
  //   );
  // }
  const onRename = useCallback(async () => {
    try {
      setIsLoading(true);
      await API.renameAnAutomation(newAutomationName, automationId);
      setShowSmartCropModal(false);
    } catch (err) {
      console.log(err);
    }
  }, [newAutomationName]);

  const onDuplicate = useCallback(async () => {
    try {
      setIsLoading(true);
      await API.duplicateAnAutomation(automationId, duplicateConfig);
      setShowSmartCropModal(false);
    } catch (err) {
      console.log(err);
    }
  }, [duplicateConfig]);

  const modalContent: ActiveOptionProps = useMemo(() => {
    switch (selectedModalType) {
      case "rename":
        return {
          title: "Rename",
          okText: "Rename",
          cancelText: "Cancel",
          disableOk: newAutomationName.trim() === "",
          onOk: onRename,
          type: "primary",
          body: (
            <RenameModalContent
              onEnter={onRename}
              setProjectName={setNewAutomationName}
              projectName={newAutomationName}
              errorMessage={""}
            />
          )
        };
      case "duplicate":
        return {
          title: "Duplicate",
          okText: "Duplicate smart crop",
          cancelText: "Cancel",
          disableOk: !duplicateConfig.duplicate_configuration && !duplicateConfig.duplicate_media && true,
          onOk: onDuplicate,
          type: "primary",
          body: (
            <DuplicateModalContent
              duplicateCheckBox={duplicateConfig}
              setDuplicateCheckBox={setDuplicateConfig}
              errorMessage={""}
            />
          )
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
  }, [selectedModalType, newAutomationName, duplicateConfig]);

  return (
    <>
      <h2 className={styles.Title}>{automationName}</h2>
      {/* <div className={styles.Actions}>
        <Button
          label={t("in_progress.left_panel.summary.favorite_label")}
          icon={<IconFavorite />}
          type="text"
          size="md"
          onClick={() => {
            // setSelectedModalType("favorite");
            toast("This automation has been added to your favorites", "success");
          }}
        />
        <Button
          label={t("in_progress.left_panel.summary.rename_label")}
          icon={<IconEdit />}
          type="text"
          size="md"
          onClick={() => {
            setShowSmartCropModal(true);
            setSelectedModalType("rename");
          }}
        />
      </div>
      <Button
        className={styles.Section}
        label={t("in_progress.left_panel.summary.duplicate_label")}
        type="default"
        onClick={() => {
          setShowSmartCropModal(true);
          setSelectedModalType("duplicate");
        }}
      /> */}
      <Divider />
      <h4 className={styles.CompletedDate}>
        {`${t("in_progress.left_panel.summary.completed_on_prefix")} ${moment(completedDate).format("MMM D, YYYY")}`}
      </h4>
      <CustomModal
        visible={showSmartCropModal}
        onCancel={() => setShowSmartCropModal(false)}
        title={`${modalContent.title}`}
        okText={modalContent.okText}
        cancelText={modalContent.cancelText}
        disableOk={modalContent.disableOk}
        onOk={modalContent.onOk}
        type={modalContent.type}
        buttonLoading={isLoading}
        danger={modalContent.type === "danger"}
      >
        {modalContent.body}
      </CustomModal>
    </>
  );
}
