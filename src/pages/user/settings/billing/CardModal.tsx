import React, { useState } from "react";
import styles from "../../../../styles/CardModal.module.css";
import "antd/dist/antd.css";
import { Button } from "../../../../ui-components/components/button";
import { CustomModal } from "../../../../ui-components/components/modal";

export type CardModalProps = {
  /**
   *
   */
  buttonText: string;
  /**
   *
   */
  buttonClassname?: string;
  /**
   *
   */
  children: React.ReactElement;
  /**
   *
   */
  buttonLabelClassName?: string;
  /**
   *
   */
  okButtonText?: string;
  /**
   *
   */
  modalTitle?: string;
  width?: number;
  buttonType?: "link" | "text" | "default" | "primary" | "ghost" | "dashed";
  danger?: boolean;
  okButtonType?: "link" | "text" | "default" | "primary" | "ghost" | "dashed";
};

export default function CardModal({
  buttonText,
  buttonClassname,
  buttonLabelClassName,
  children,
  okButtonText,
  modalTitle,
  width,
  buttonType,
  danger = false,
  okButtonType
}: CardModalProps) {
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(true);

  const onButtonClick = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setVisible(false);
  };

  return (
    <>
      <Button
        type={buttonType ? buttonType : "primary"}
        label={buttonText}
        onClick={onButtonClick}
        className={buttonClassname}
        labelClassName={buttonLabelClassName ? buttonLabelClassName : undefined}
      />

      <CustomModal
        title={modalTitle}
        okText={okButtonText}
        cancelText="Cancel"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        type={okButtonType ? okButtonType : "primary"}
        confirmLoading={confirmLoading}
        width={width}
        danger={danger}
      >
        {children}
      </CustomModal>
    </>
  );
}
