import React, { useCallback, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";

import { LOGIN_PAGE, redirectToApplication, redirectToPath } from "../lib/navigation/routes";
import { useRouter, withRouter } from "next/router";

import { LeftPanel } from "../ui-components/components/left-panel";
import { StartAutomation } from "../ui-components/home-components/start-automation";
import { Breadcrumbs } from "../ui-components/components/breadcrumb";
import { UserProjects } from "../ui-components/home-components/user-projects";
import { useIntercom } from "react-use-intercom";
import { useAuth } from "../hooks/useAuth";
import Optional from "../util/Optional";
import { UserDetails } from "../context/IAuthContext";

const logger = new Logger("pages:index.tsx");

function Application(props: any) {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const router = useRouter();
  const breadcrumbPathArray = [[t("home.home"), ""]];
  const { trackEvent } = useIntercom();

  const { user } = useAuth();
  useEffect(() => {
    logger.debug("In useEffect home page. Calling onUser.");
    setIsLoaded(false);
    user().then((value: Optional<UserDetails>) => {
      if (value.isEmpty()) {
        logger.debug("In useEffect home page. onUser done. Moving to login page.");
        redirectToPath(LOGIN_PAGE, router, window);
      } else {
        logger.debug("In useEffect home page. onUser done. User found.");
        setIsLoaded(true);
      }
    });
    // eslint-disable-next-line
  }, []);

  /*
    const redirectToLogin = useCallback(function () {
      redirectToPath(LOGIN_PAGE, router, window);
      // eslint-disable-next-line
    }, []);*/

  /*  const onSessionRefresh = useCallback(function (sessionPresent: boolean) {
      if (!sessionPresent) {
        redirectToLogin();
      } else {
        setIsLoaded(true);
      }
      // eslint-disable-next-line
    }, []);*/

  /* useEffect(() => {
     logger.debug("in use effect of main app");
     setIsLoaded(false);
     AuthenticationController.refreshSession().then(onSessionRefresh);
     // eslint-disable-next-line
   }, []);*/

  function onSmartCropClick() {
    router.push("/smart-crop");
    logger.info("****Redirect to crop configuration page");
    trackEvent("crop-configure-start"); // This will allow us to track how much time did they spend in the configurator
  }

  /**
   *
   * @returns
   */
  function getAutomationOptions() {
    return [
      {
        id: "smartCrop",
        icon: "/images/smartCrop.svg",
        title: t("home.smart_crop"),
        description: t("home.available"),
        onClick: onSmartCropClick
      },
      {
        id: "smartLabels",
        icon: "/images/smartLabels.svg",
        title: t("home.smart_labels"),
        description: t("home.coming_soon"),
        disabled: true
      },
      {
        id: "smartClip",
        icon: "/images/smartClip.svg",
        title: t("home.smart_clip"),
        description: t("home.coming_soon"),
        disabled: true
      }
    ];
  }

  if (!isLoaded) {
    return <div />;
  }

  return (
    <div className={styles.homePage}>
      <LeftPanel selectedPage="Home" />
      <div className={styles.content}>
        <div className={styles.homeHeader}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div className={styles.homeContent}>
          <StartAutomation automationOptions={getAutomationOptions()} heading={t("home.start_automation")} />
          <UserProjects />
        </div>
      </div>
    </div>
  );
}

//export default Application;
let withRouter1 = withRouter(Application);
// @ts-ignore

export default withRouter1;
