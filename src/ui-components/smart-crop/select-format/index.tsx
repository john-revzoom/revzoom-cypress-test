import { Button } from "../../components/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckboxOptionType } from "antd/lib/checkbox/Group";
import { FormInstance, Row } from "antd";
import { useIntercom } from "react-use-intercom";
import Form from "antd/lib/form";
import Checkbox from "antd/lib/checkbox";
import AddCustomModal from "./AddCustomModal";
import Help from "../../assets/icons/help.svg";
import DeleteIcon from "../../../../public/images/delete.svg";
import styles from "./select-format.module.scss";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { CustomModal } from "../../components/modal";
import { toast } from "../../components/toast";
// import { SocialMediaFormats, SocialMediaFormatsType } from "./select-format-utils";

type SelectFormatProps = {
  onShowAddCustom: (show: boolean) => void;
};

export default function SelectFormat({ onShowAddCustom }: SelectFormatProps) {
  // const [assetFormats] = useState<Array<SocialMediaFormatsType>>(SocialMediaFormats);
  // const [checkedVideoFormats] = useState<CheckboxValueType[]>([]);
  const [customFormats, setCustomFormats] = useState<CheckboxOptionType[]>([]);
  const [latestCustomSize, setLatestCustomSize] = useState<CheckboxOptionType>();
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [localCustomSizes, setLocalCustomSizes] = useLocalStorage<CheckboxOptionType[]>("custom_sizes", []);
  const { showArticle } = useIntercom();
  const { t } = useTranslation();

  useEffect(() => {
    if (!!localCustomSizes && localCustomSizes?.length > 0) {
      setCustomFormats(localCustomSizes);
    }
  }, []);

  // function toCheckboxOptions(f: SocialMediaFormatsType): Array<CheckboxOptionType | string | number> {
  //   return f.formats.map(function (v, index: number) {
  //     const prefix = v.mediaSize ? v.mediaSize.toString() : "";
  //     const suffix = t(v.configName.toString().toLowerCase());

  //     return {
  //       label: `${prefix} (${suffix})`,
  //       value: index
  //     };
  //   });
  // }

  // const onChange = (value: string | number, key: number, field: string) => {
  //   const assignObj = (value: string | number) => {
  //     let obj = {};
  //     //@ts-ignore
  //     obj[field] = value;
  //     //@ts-check
  //     Object.assign(customFormats[key], obj);
  //   };
  //   let customFormats = form.getFieldValue(["customFormats"]);
  //   let onlyNumbers: string | number = value.toString().replace(/\D/g, "");
  //   let num: string | number = Number(onlyNumbers);
  //   if (value === "" || num === 0) {
  //     assignObj("");
  //     form
  //       .validateFields()
  //       .then(values => {})
  //       .catch(err => console.log(err));
  //   } else {
  //     if (!isNaN(num) && isNumber(num)) {
  //       assignObj(num);
  //     } else {
  //       if (num === 0) {
  //         num = "";
  //       }
  //       assignObj(num);
  //     }
  //   }
  //   form.setFieldsValue({ customFormats });
  // };

  function handleSaveSize(width: number, height: number) {
    const customSize = `${width}x${height}`;
    const newCustomSizes = [...customFormats, { label: customSize, value: customSize }];
    const isNotExist = !customFormats?.find(cf => cf.value === customSize);
    if (isNotExist) {
      setCustomFormats(newCustomSizes);
      setLocalCustomSizes(newCustomSizes);
      setLatestCustomSize({ label: customSize, value: customSize });
      setShowAddCustom(false);
      onShowAddCustom(false);
    } else {
      toast(t("upload.add_custom_size.errors.custom_size_exists"), "error");
    }
  }

  function handleDelete(newFormats: CheckboxOptionType[]) {
    setCustomFormats(newFormats);
    setLocalCustomSizes(newFormats);
  }

  return (
    <div className={styles.selectFormatContainer}>
      <div className={styles.label}>
        {t("upload.select_format.title")}
        <Help
          className={styles.helpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6123039);
          }}
        />
      </div>
      <div className={styles.origAndCustomContainer}>
        <Form.Item name="original" valuePropName="checked" noStyle>
          <Checkbox className={styles.formatCheckbox}>{t("media.original")}</Checkbox>
        </Form.Item>
        {customFormats?.length > 0 ? (
          <>
            <Form.Item name="customFormats">
              <Checkbox.Group>
                {customFormats.map((f: CheckboxOptionType, index: number) => {
                  return (
                    <CustomFormatCheckBox key={index} f={f} customFormats={customFormats} onDelete={handleDelete} />
                  );
                })}
              </Checkbox.Group>
            </Form.Item>
          </>
        ) : null}
        <Button
          type="text"
          label={t("media.add_custom")}
          onClick={() => {
            setShowAddCustom(true);
            onShowAddCustom(true);
          }}
          style={{
            marginTop: customFormats?.length > 0 ? 8 : 24
          }}
          className={styles.addCustomBtn}
        />
      </div>
      {/* {assetFormats.map((f: SocialMediaFormatsType, index: number) => {
        return (
          <div key={f.title + "-" + index}>
            <h1 className={styles.formatTitle}>
              {t(f?.title)}
              <Help
                className={styles.helpIcon}
                width={14}
                viewBox="0 0 18 16"
                onClick={() => {
                  showArticle(6123094);
                }}
              />
            </h1>
            {t(f?.title) === t("media.social_media") ? (
              <Form.Item name="socialMedia" noStyle>
                <CheckboxGroup options={toCheckboxOptions(f)} />
              </Form.Item>
            ) : (
              <CheckboxGroup options={toCheckboxOptions(f)} value={[]} />
            )}
          </div>
        );
      })} */}

      <AddCustomModal
        visible={showAddCustom}
        onCancel={() => {
          setShowAddCustom(false);
          onShowAddCustom(false);
        }}
        onSaveSize={handleSaveSize}
      />
    </div>
  );
}

interface CustomFormatCheckBoxProps {
  f: CheckboxOptionType;
  onDelete: (formats: CheckboxOptionType[]) => void;
  customFormats: CheckboxOptionType[];
}

function CustomFormatCheckBox({ f, onDelete, customFormats }: CustomFormatCheckBoxProps) {
  const [hover, setHover] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { t } = useTranslation();
  return (
    <Row onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={styles.CustomFormatGroup}>
      {" "}
      <Checkbox value={f.value}>{f.label}</Checkbox>{" "}
      {hover ? (
        <Button
          size="sm"
          icon={<DeleteIcon />}
          onClick={() => {
            const filteredCustomSize = [...customFormats].filter(c => c.value !== f.value);
            onDelete(filteredCustomSize);
          }}
        />
      ) : null}
      {/* <CustomModal
        title={t("upload.add_custom_size.confirm_delete_title")}
        okText={t("asset.delete")}
        cancelText={t("asset.do_not_delete")}
        visible={showConfirm}
        onOk={() => {
          setShowConfirm(false);
          const filteredCustomSize = [...customFormats].filter(c => c.value !== f.value);
          onDelete(filteredCustomSize);
        }}
        onCancel={() => setShowConfirm(false)}
        type="danger"
        danger
      >
        <p className={styles.DeleteModalContent}>{t("upload.add_custom_size.confirm_delete_desc")}</p>
      </CustomModal> */}
    </Row>
  );
}
