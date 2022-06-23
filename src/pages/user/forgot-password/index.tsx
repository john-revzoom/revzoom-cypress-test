import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  LOGIN_PAGE,
  redirectToPath,
  getQueryParam,
  RESET_PASSWORD_PAGE,
  redirectToPathWithParams,
  redirectToApplication
} from "../../../lib/navigation/routes";
import { useAuth } from "../../../hooks/useAuth";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import { ForgotPassword } from "../../../ui-components/components/forgot-password";
import AuthenticationController from "../../../controller/AuthenticationController";
import { AuthWrapper } from "../../../ui-components/components/auth-wrapper";
import { Logger } from "aws-amplify";

import styles from "../../../styles/Forgot-Password.module.css";
import { t } from "i18next";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";

const logger = new Logger("pages:user:forgot-password:ForgotPasswordPage");
/**
 *
 * @returns
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    logger.debug("in use effect of settings page");
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        redirectToApplication(router);
      }
    });
  }, []);

  useEffect(() => {
    logger.debug("I am on client", "forgot-password/index.tsx");
    let userId: string | string[] | null = getQueryParam("userId");
    if (userId && typeof userId === "string") onChangeOfEmail(userId);
  }, []);

  /**
   *
   * @param value
   */
  function onChangeOfEmail(value: string) {
    setValidEmail(AuthenticationController.isValidEmail(value));
    setEmail(value);
  }

  /**
   *
   */
  async function onResetPasswordClick() {
    try {
      redirectToPathWithParams(RESET_PASSWORD_PAGE, { userId: email }, router, window);
    } catch (err: any) {
      logger.error("Error in forgot password:", err);
    }
  }

  /**
   *
   */
  function onBackToSignInClick() {
    redirectToPath(LOGIN_PAGE, router, window);
  }

  /**
   *
   * @param id
   */
  async function onSSOLoginClick(id: string) {
    try {
      await AuthenticationController.ssoSignIn(id);
    } catch (err: any) {
      logger.error("onSSOLoginClick", err);
    }
  }

  return (
    <AuthWrapper
      className={styles.CustomWrapper}
      title={t("forgot_password.title")}
      description={t("forgot_password.help_text")}
      onSocialButtonClick={onSSOLoginClick}
    >
      <ForgotPassword
        emailId={email}
        enableResetPwdButton={validEmail}
        onChangeOfEmail={onChangeOfEmail}
        onBackToSignIn={onBackToSignInClick}
        onResetPassword={onResetPasswordClick}
      />
    </AuthWrapper>
  );
}
