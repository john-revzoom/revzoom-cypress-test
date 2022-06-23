import React, { SetStateAction, useCallback, useMemo, useState } from "react";
import classnames from "classnames";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Dropdown } from "../dropdown";
import { CustomModal } from "../modal";
import { Tooltip } from "../tooltip";
import { LegacyButtonType } from "antd/lib/button/button";
import { RenameModalContent, DuplicateModalContent, DeleteModalContent } from "./modal-content";
import API from "../../../util/web/api";
import { AUTOMATION_STATUS, SMART_CROP } from "../../../common/Enums";
import AutomationItem from "../../../models/AutomationItem";
import { useRouter } from "next/router";
import { updateAutomationId, updateSmartCropStatus, updateView } from "../../../redux/actions/smartcropActions";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import isUndefined from "lodash/isUndefined";

import styles from "./project-card.module.scss";
import "antd/dist/antd.css";
import { toast } from "../toast";

type PropsFromRedux = ConnectedProps<typeof connector>;

export interface ProjectCardProps extends PropsFromRedux {
  /**
   * ID of the project
   */
  id: string;
  /**
   /**
   * Title of the project
   */
  title: string;
  /**
   * status of the project
   */
  status: string;
  /**
   * status icon path
   */
  statusIcon?: string;
  /**
   * created time of the project
   */
  createdTime: string;
  /**
   * created time of the project
   */
  projectList: AutomationItem[];
  /**
   * created time of the project
   */
  setProjectList: Function;
  /**
   * a new instanciated project item
   */
  project: AutomationItem;
}

export type ActiveOptionProps = {
  title: string;
  okText: string;
  cancelText: string;
  disableOk?: boolean;
  disableCancel?: boolean;
  onOk: React.MouseEventHandler<HTMLElement>;
  type: LegacyButtonType;
  body?: any;
};

export interface IduplicateCheckBox {
  duplicate_configuration: boolean;
  duplicate_media: boolean;
}

function ProjectCard({
  id,
  title,
  status,
  createdTime,
  project,
  projectList,
  setProjectList,
  updateSmartCropStatus,
  updateCurrentView
}: ProjectCardProps) {
  const router = useRouter();
  //  Modal Toggle state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [modalName, setModalName] = useState<string | undefined>();

  const [errorMessage, setErrorMessage] = useState<string>("");

  //Rename option state
  const [projectName, setProjectName] = useState<string>(title);
  //Update the Project list with the new name
  const updateRenameList = () => {
    let index = projectList.findIndex(x => x.getAutomationId() === id);
    if (index !== -1) {
      let tempArray: AutomationItem[] = projectList.slice();
      tempArray[index].setName(projectName);
      setProjectList(tempArray);
    }
  };
  const onRename = useCallback(async () => {
    try {
      setIsLoading(true);
      let res = await API.renameAnAutomation(projectName, id);
      res.onResponse(data => {
        if (data.status === 200) {
          updateRenameList();
          setIsModalVisible(false);
          setIsLoading(false);
          toast("Automation Renamed");
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, [modalName, projectName]);

  //Delete Option State
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  //get the list and update it in frontend
  const updateDeletedList = () => {
    let filteredProj = projectList.filter(x => x.getAutomationId() !== id);
    setProjectList(filteredProj);
  };
  const onDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      let res = await API.deleteAnAutomation(id);
      res.onResponse(data => {
        if (data.status === 200) {
          if (data?.data?.success === true) {
            updateDeletedList();
            setIsModalVisible(false);
            setIsLoading(false);
            toast(`${title} deleted`);
          }
        }
      });
      setDeleteConfirm("");
    } catch (err) {
      console.log(err);
    }
  }, [modalName, deleteConfirm]);

  //Duplicate Option State
  const [duplicateCheckBox, setDuplicateCheckBox] = useState<IduplicateCheckBox>({
    duplicate_configuration: true,
    duplicate_media: true
  });
  //update the list with the new duplication item.
  const updateDuplicateList = (data: AutomationItem) => {
    setProjectList([data, ...projectList]);
  };
  const onDuplicate = useCallback(async () => {
    try {
      setIsLoading(true);
      let res = await API.duplicateAnAutomation(id, duplicateCheckBox);
      res.onResponse(data => {
        if (data.status === 200) {
          let automationItem = AutomationItem.toAutomationItem(data?.data);
          updateDuplicateList(automationItem);
          setIsLoading(false);
          setIsModalVisible(false);
          toast(`${title} duplicated`);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, [modalName, duplicateCheckBox]);

  //Modal content for different options
  const modalContent: ActiveOptionProps = useMemo(() => {
    switch (modalName) {
      case "rename":
        return {
          title: "Rename",
          okText: "Rename",
          cancelText: "Cancel",
          disableOk: projectName.trim() === "" || projectName.trim() === title,
          onOk: onRename,
          type: "primary",
          body: (
            <RenameModalContent
              onEnter={onRename}
              setProjectName={setProjectName}
              projectName={projectName}
              errorMessage={errorMessage}
            />
          )
        };
      case "duplicate":
        return {
          title: "Duplicate",
          okText: "Duplicate smart crop",
          cancelText: "Cancel",
          disableOk: !duplicateCheckBox.duplicate_configuration && !duplicateCheckBox.duplicate_media,
          onOk: onDuplicate,
          type: "primary",
          body: (
            <DuplicateModalContent
              duplicateCheckBox={duplicateCheckBox}
              setDuplicateCheckBox={setDuplicateCheckBox}
              errorMessage={errorMessage}
            />
          )
        };
      case "delete":
        return {
          title: "Delete",
          okText: "Delete",
          cancelText: "Don't delete",
          disableOk: deleteConfirm.toLowerCase().trim() !== "delete" && true,
          onOk: onDelete,
          type: "danger",
          body: (
            <DeleteModalContent
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              errorMessage={errorMessage}
              onEnter={onDelete}
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
  }, [modalName, projectName, deleteConfirm, duplicateCheckBox, projectList]);

  /**
   *
   *
   */

  function renameProject() {
    setModalName("rename");
    setProjectName(title);
    setIsModalVisible(true);
  }

  /**
   *
   *
   */
  function duplicateProject() {
    setModalName("duplicate");
    setDuplicateCheckBox({ duplicate_configuration: true, duplicate_media: true });
    setIsModalVisible(true);
  }

  /**
   *
   *
   */
  function deleteProject() {
    setDeleteConfirm("");
    setModalName("delete");
    setIsModalVisible(true);
  }

  const projectMenu = [
    {
      id: "rename",
      label: "Rename",
      onClick: renameProject
    },
    {
      id: "duplicate",
      label: "Duplicate",
      onClick: duplicateProject
    },
    {
      id: "delete",
      label: "Delete",
      onClick: deleteProject
    }
  ];

  /**
   *
   * @param projectStatus
   */
  function getStatusImage(projectStatus: string) {
    switch (projectStatus) {
      case AUTOMATION_STATUS.RUNNING:
        const antIcon = <LoadingOutlined style={{ fontSize: 16, color: "#fff" }} spin />;
        return <Spin indicator={antIcon} />;
      case AUTOMATION_STATUS.COMPLETED:
        return <img src="/images/completed.svg" />;
      default:
        return "";
    }
  }

  function getProjectStatus(projectStatus: string) {
    if (project.isCompleted()) {
      return "Completed";
    }
    if (project.isNotConfigured()) {
      return "Not Configured";
    }
    return projectStatus?.toLowerCase();
  }

  function handleClick() {
    let status = AUTOMATION_STATUS.NOT_CONFIGURED;
    // updateAutomationId(Number(project.getAutomationId()));
    if (project.isConfigured()) {
      status = AUTOMATION_STATUS.CONFIGURED;
    }
    if (project.isRunning()) {
      updateCurrentView("summary");
      status = AUTOMATION_STATUS.RUNNING;
    }
    if (project.isCompleted()) {
      updateCurrentView("summary");
      status = AUTOMATION_STATUS.COMPLETED;
    }
    updateSmartCropStatus(status);
    if (isUndefined(project.getAutomationId())) return;
    router.push(`/smart-crop?automationId=${project.getAutomationId()}`);
  }

  return (
    <>
      <div className={styles.projectCard} data-cy="project-card">
        <div
          className={classnames(styles.projectDetail, {
            [styles.disabled]: project.isCompleted()
          })}
          onClick={handleClick}
        >
          <div className={styles.projectStatus}>
            <div className={styles.status}>
              <span className={styles.statusIcon}>{getStatusImage(status || "")}</span>
              <span className={styles.statusName}>{getProjectStatus(status || "")}</span>
            </div>
          </div>
          <div className={styles.projectTitle}>
            <Tooltip title={title} placement="topLeft">
              <span>{title}</span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.bottomOptions} data-cy="project-footer">
          <div className={styles.createdTime}>Created {createdTime}</div>
          <div className={styles.projectActions} data-cy="project-actions">
            <Dropdown dropdownItems={projectMenu} triggerOn="hover" label={"..."} data-cy="project-dropdown" />
          </div>
        </div>
      </div>
      <CustomModal
        title={`${modalContent.title} ${title}`}
        okText={modalContent.okText}
        cancelText={modalContent.cancelText}
        disableOk={modalContent.disableOk}
        visible={isModalVisible}
        onOk={modalContent.onOk}
        onCancel={() => setIsModalVisible(false)}
        type={modalContent.type}
        buttonLoading={isLoading}
        danger={modalContent.type === "danger"}
      >
        <>{modalContent.body}</>
      </CustomModal>
    </>
  );
}

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  smartCropStatus: state.smartcrop.smartCropStatus
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateSmartCropStatus: (status: string) => dispatch(updateSmartCropStatus(status)),
  updateAutomationId: (id: number) => dispatch(updateAutomationId(id)),
  updateCurrentView: (view: string) => dispatch(updateView(view))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ProjectCard);
