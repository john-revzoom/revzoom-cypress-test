import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { useRouter } from "next/router";
import {
  FORGOT_PASSWORD_PAGE,
  redirectToApplication,
  redirectToPath,
  redirectToPathWithParams,
  SIGNUP_PAGE,
  VERIFY_SIGNUP_PAGE
} from "../../../lib/navigation/routes";
import { useAuth } from "../../../hooks/useAuth";

import { LoginBlock } from "../../../ui-components/components/login-block";

import AuthenticationController from "../../../controller/AuthenticationController";
import { AuthWrapper } from "../../../ui-components/components/auth-wrapper";
import { Logger } from "aws-amplify";
import { toast } from "../../../ui-components/components/toast";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";
import { VerticalButtonBar } from "../../../ui-components/components/vertical-button-bar";

const logger = new Logger("pages:user:login:Login");

/**
 *
 * @returns
 */
export default function Login() {
  const { t } = useTranslation();
  const LOGIN_PAGE_HEADER: string = t("login.title");
  const LOGIN_PAGE_EMAIL_LBL: string = t("login.placeholders.email");
  const LOGIN_PAGE_PASSWORD_LBL: string = t("login.placeholders.password");
  const SIGN_IN_BTN_LBL: string = t("login.sign_in");
  const SIGNING_IN_BTN_LBL: string = t("login.signing_in");
  const CREATE_ACCOUNT_BTN_LBL: string = t("login.create_account");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, toggleSigningIn] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    logger.debug("Component mount: ", router.pathname);
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        redirectToApplication(router);
      }
    });
    return () => {
      logger.debug("Component unmount: ", router.pathname);
    };
    // eslint-disable-next-line
  }, []);

  const { trackEvent } = useIntercom();

  /**
   *
   * @param e
   */
  function onUsernameChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setEmail(e.currentTarget.value);
  }

  /**
   *
   * @param e
   */
  function onPasswordChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  /**
   *
   */
  function onForgotPassword(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    redirectToPathWithParams(FORGOT_PASSWORD_PAGE, { userId: email }, router, window);
  }

  /**
   *
   */
  async function signIn() {
    if (isSigningIn) return;
    toggleSigningIn(true);
    logger.debug("signIn onClick");
    try {
      const session: CognitoUserSession = await AuthenticationController.signIn(email, password);
      if (session) {
        trackEvent("crop-signin-completed");
        redirectToApplication(router);
      }
    } catch (err: any) {
      if (AuthenticationController.checkIfUserNotConfirmedException(err)) {
        logger.debug("redirectToPathWithParams to Signup page", err);
        AuthenticationController.resendSignUpCode(email).then(() => {
          redirectToPathWithParams(VERIFY_SIGNUP_PAGE, { userId: email }, router, window);
        });
      } else {
        logger.debug("signIn toastError", err);
        // setError(err?.message ? err.message : err.toString());
        toast(err?.message ?? err.toString(), "error");
      }
    }

    toggleSigningIn(false);
  }

  /**
   *
   */
  function signUp() {
    redirectToPath(SIGNUP_PAGE, router, window);
  }

  /**
   *
   * @param id
   */
  async function onSSOLoginClick(id: string) {
    try {
      await AuthenticationController.ssoSignIn(id);
    } catch (err: any) {
      // setError(err.message ? err.message : err.toString());
      // console.log("Error signing in : " + err.toString());
      logger.debug("onSSOLoginClick error", err);
      toast(err?.message ?? err.toString, "error");
    }
  }

  const isLoginValuesValid = useMemo(() => {
    return AuthenticationController.isLoginValuesValid(email, password);
  }, [email, password]);

  return (
    <AuthWrapper title={LOGIN_PAGE_HEADER} onSocialButtonClick={onSSOLoginClick}>
      <LoginBlock
        userName={email}
        password={password}
        userNameLbl={LOGIN_PAGE_EMAIL_LBL}
        passwordLbl={LOGIN_PAGE_PASSWORD_LBL}
        createAccountBtnLbl={CREATE_ACCOUNT_BTN_LBL}
        signInBtnLbl={SIGN_IN_BTN_LBL}
        signingInBtnLbl={SIGNING_IN_BTN_LBL}
        // enableSignInButton={isLoginValuesValid}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onForgotPassword={onForgotPassword}
        onSignIn={signIn}
        onCreateAccount={signUp}
        isSubmitting={isSigningIn}
      />
    </AuthWrapper>
  );
}
