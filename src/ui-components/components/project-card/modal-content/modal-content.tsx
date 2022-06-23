import React, { SetStateAction } from "react";
import { InputWithLabel } from "../../composite/input-with-label";
import { Checkbox } from "../../checkbox";
import styles from "./modal-content.module.scss";
import { IduplicateCheckBox } from "../project-card";

type RenameModalContentProps = {
  setProjectName: React.Dispatch<SetStateAction<string>>;
  projectName: string;
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  errorMessage: string;
};
type DuplicateModalContentProps = {
  duplicateCheckBox: IduplicateCheckBox;
  setDuplicateCheckBox: React.Dispatch<SetStateAction<IduplicateCheckBox>>;
  errorMessage: string;
};
type DeleteModalContentProps = {
  deleteConfirm: string;
  setDeleteConfirm: React.Dispatch<SetStateAction<string>>;
  errorMessage: string;
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const RenameModalContent = ({ setProjectName, projectName, onEnter, errorMessage }: RenameModalContentProps) => {
  return (
    <>
      <InputWithLabel
        labelText="Enter new name"
        labelPosition="TOP"
        text={projectName}
        inputAsMandatory={true}
        onPressEnter={onEnter}
        OnChangeOfInputValue={(e: React.ChangeEvent<HTMLInputElement>) => {
          setProjectName(e.target.value);
        }}
        focusOnEnd={true}
      />
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};

export const DuplicateModalContent = ({
  duplicateCheckBox,
  setDuplicateCheckBox,
  errorMessage
}: DuplicateModalContentProps) => {
  return (
    <>
      <p className={styles.duplicatePara}>You’re about to start a new smart crop automation!</p>
      <div className={styles.duplicateCheckBoxWrapper}>
        <Checkbox
          text="Duplicate smart crop configuration"
          onChange={e => setDuplicateCheckBox({ ...duplicateCheckBox, duplicate_configuration: e.target.checked })}
          checked={duplicateCheckBox.duplicate_configuration}
          className={styles.checkBox}
        />
        <br />
        <Checkbox
          text="Duplicate media"
          onChange={e => setDuplicateCheckBox({ ...duplicateCheckBox, duplicate_media: e.target.checked })}
          checked={duplicateCheckBox.duplicate_media}
          className={styles.checkBox}
        />
      </div>
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};

export const DeleteModalContent = ({
  deleteConfirm,
  setDeleteConfirm,
  errorMessage,
  onEnter
}: DeleteModalContentProps) => {
  return (
    <>
      <p>You will not be able to restore this project in any way. Enter delete below to confirm your delete</p>
      <InputWithLabel
        labelText="Enter delete"
        labelPosition="TOP"
        placeHolderText="delete"
        text={deleteConfirm}
        inputAsMandatory={true}
        OnChangeOfInputValue={(e: React.ChangeEvent<HTMLInputElement>) => {
          setDeleteConfirm(e.target.value);
        }}
        focusOnEnd={true}
        onPressEnter={onEnter}
      />
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};
