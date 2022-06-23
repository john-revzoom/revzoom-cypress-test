import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { updateLargePreview, updateView } from "../../../redux/actions/smartcropActions";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { Breadcrumbs } from "../breadcrumb";
import { Button } from "../button";
import styles from "./smartcrop-navbar.module.scss";
import IconClose from "../../assets/icons/icon-close.svg";
import { useRouter } from "next/router";
import { AUTOMATION_STATUS } from "../../../common/Enums";

type ReduxProps = ConnectedProps<typeof connector>;

interface SmartCropNavbarProps extends ReduxProps {}

const SmartCropNavbar = ({
  processed,
  total,
  automationStatus,
  largePreview,
  updateLargePreview
}: SmartCropNavbarProps) => {
  const router = useRouter();
  const pathArray = [
    ["Configurations", ""],
    ["Select Media", ""],
    ["Smart Crop", "/smart-crop"]
  ];

  const handleClose = () => {
    if (largePreview) {
      updateLargePreview();
    } else {
      router.push("/");
    }
  };

  const isFinished = total > 0 && processed === total;
  return (
    <div className={styles.Wrapper}>
      <Button type="text" className={styles.BtnClose} icon={<IconClose />} onClick={handleClose} />
      {largePreview ? <h1 className={styles.Title}>{largePreview.name}</h1> : null}
      {automationStatus === AUTOMATION_STATUS.RUNNING && !largePreview && <Breadcrumbs pathArray={pathArray} />}
      {automationStatus === AUTOMATION_STATUS.COMPLETED && !largePreview && <h1 className={styles.Title}>Summary</h1>}
      {/* {isFinished && currentView === "smartcrop" && (
        <Button type="primary" label="Done" className={styles.BtnDone} onClick={() => updateCurrentView("summary")} />
      )} */}
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  processed: state.smartcrop.processed,
  total: state.smartcrop.total,
  currentView: state.smartcrop.currentView,
  automationStatus: state.smartcrop.smartCropStatus,
  largePreview: state.smartcrop.largePreview
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateCurrentView: (view: string) => dispatch(updateView(view)),
  updateLargePreview: () => dispatch(updateLargePreview(undefined))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropNavbar);
