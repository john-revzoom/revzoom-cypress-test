import React, { useEffect, useState } from "react";
import classNames from "classnames";
import "antd/dist/antd.css";
import styles from "./userPanel.module.scss";
import { Button } from "../../../button";
import { Divider } from "../../../divider";
import { useRouter } from "next/router";
import { useAuth } from "../../../../../hooks/useAuth";
import AuthenticationController from "../../../../../controller/AuthenticationController";
import { useTranslation } from "react-i18next";
import { NAVIGATION_MENU } from "../../../../../common/Enums";

import {
  redirectToApplication,
  redirectToPath,
  SETTING_AND_BILLING_PAGE,
  SETTINGS_PAGE
} from "../../../../../lib/navigation/routes";
import { BillingIcon, SettingsIcons } from "../../../../assets";
import { Avatar, Col, Row } from "antd";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import Optional from "../../../../../util/Optional";
import { UserDetails } from "../../../../../context/IAuthContext";
// import { NavigationListItem } from "../navigation-list/navigationList";

export type UserPanelProps = {
  selectedPage: string;
};

//TO-DO: Need to make this component proper to take items as props. Before that required an unified Image component
export function UserPanel({ selectedPage }: UserPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(t("loading") + "...");

  useEffect(() => {
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        setFirstName(AuthenticationController.getUserFirstName(value.get().cognito?.getSignInUserSession()));
      }
    });
    // eslint-disable-next-line
  }, [user]);

  function getFirstCharOfUserName() {
    const userName = firstName ? firstName : " ";
    return userName[0] || "";
  }

  function navigateToBilling() {
    redirectToPath(SETTING_AND_BILLING_PAGE, router, window);
  }

  function navigateToSettings() {
    redirectToPath(SETTINGS_PAGE, router, window);
  }

  function ProfileIcon() {
    return <Avatar>{getFirstCharOfUserName()}</Avatar>;
  }

  const isPageSettings = selectedPage === NAVIGATION_MENU.SETTINGS;
  return (
    <div className={classNames(styles.userPanel, !isPageSettings ? styles.userProfileHighlight : "")}>
      <Row align="middle" justify="space-between">
        <Col span={2}>
          <ProfileIcon />
        </Col>
        <Col span={12}>
          <Button type="text" label={firstName} onClick={navigateToSettings} />
        </Col>
        <Col span={6}>
          <Button
            type="text"
            className={classNames(styles.settingIcon, isPageSettings ? styles.selected : "")}
            icon={<SettingsIcons />}
            label=""
            onClick={navigateToSettings}
            dataCy="settingIcon"
          />
        </Col>
      </Row>
    </div>
  );
}
