import React, { useState, useEffect, useRef } from "react";
import { LeftPanel } from "../../../../ui-components/components/left-panel";
import styles from "../../../../styles/Billing.module.css";
import { Breadcrumbs } from "../../../../ui-components/components/breadcrumb";
import { redirectToPath, SETTINGS_PAGE, PLANS_PAGE } from "../../../../lib/navigation/routes";
import { Button } from "../../../../ui-components/components/button";
import { Col, Row } from "antd";
import { useRouter } from "next/router";
import ReceiptContainer from "./ReceiptContainer";
import { CustomModal } from "../../../../ui-components/components/modal";
import { useTranslation } from "react-i18next";
import CardModal from "./CardModal";
import { Input } from "../../../../ui-components/components/input";
import AddNewCard from "./AddNewCard";

export default function BillingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  function changePlan() {
    redirectToPath(PLANS_PAGE, router, window);
  }
  const planDuration = "Monthly";
  const switchToPlan = planDuration === "Monthly" ? "Annual" : "Monthly";
  const [visible, setVisible] = useState(false);

  let breadcrumbPathArray = [["Settings", SETTINGS_PAGE], ["Billing"]];
  let receiptDataArray = [
    ["Oct 2, 2022", "4838423942372", "$50", "https://www.google.com/"],
    ["Nov 2, 2022", "4838423945792", "$90", "https://www.google.com/"]
  ];

  //currentPlan, planRate, currentBalance
  let userInfo = {};
  let userPlanData = {
    newUser: false,
    currentPlan: "Essential",
    planRate: "$25",
    currentBalance: "$2",
    nextCharge: "$265",
    nextChargeDate: "Mar 1,2022",
    cropsRemaining: "100"
  };

  useEffect(() => {
    userPlanData.newUser ? redirectToPath(PLANS_PAGE, router, window) : null;
  }, []);
  let userCardData = {
    cardType: "mastercard",
    cardDigits: "**** 3839",
    cardExpiry: "10/24"
  };

  const switchPlan = () => {
    setVisible(true);
  };
  const confirmSwitchPlan = () => {
    setVisible(false);
  };
  const cardDetails = (updateButton = false) => {
    return (
      <>
        <img
          src={userCardData.cardType == "mastercard" ? "/images/mastercard-icon.svg" : ""}
          className={styles.cardType}
        />
        <div style={{ display: "inline-block" }}>
          <p className={styles.cardDetail}>Mastercard ending in {userCardData.cardDigits}</p>
          <p className={styles.cardExpiryDate}>Expires on {userCardData.cardExpiry}</p>
          {updateButton ? (
            <CardModal
              buttonText="Update"
              buttonClassname={styles.update}
              buttonLabelClassName={styles.buttonLabelColor}
              buttonType="text"
              okButtonText={"Update"}
              modalTitle={"Update credit card"}
              width={576}
            >
              <AddNewCard paymentRequired={false} />
            </CardModal>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div style={{ height: "calc(100% - 76px)", overflow: "auto" }}>
          <div className={styles.planStatusContainer}>
            <div className={styles.planStatus}>
              You’re on the {userPlanData.currentPlan} plan
              <div className={styles.planRate}>{userPlanData.planRate} per month</div>
            </div>

            <Button className={styles.changePlan} label="Change Plan" onClick={changePlan} />
          </div>

          <Row className={styles.planUpdateContainer}>
            <Col span={5} className={styles.balanceContainer}>
              <p className={styles.balanceTitle}>Current balance</p>
              <p className={styles.balance}>{userPlanData.currentBalance}</p>
              <CardModal
                buttonLabelClassName={styles.buttonLabelColor}
                buttonType="text"
                buttonText="Add credits"
                buttonClassname={styles.addCredits}
                okButtonText={"Add Credits"}
                modalTitle="Add credits"
              >
                <p>
                  Add credits to your account and avoid any interruptions on your automations. You’re currently on the
                  Essential plan and are paying $0.25 per crop after limit.
                  <div className={styles.learnMore}>Learn more</div>
                  <div style={{ marginTop: "20px" }}>{cardDetails()}</div>
                  <CardModal
                    buttonText="Use a different card"
                    buttonClassname={styles.useDifferentCard}
                    buttonLabelClassName={styles.buttonLabelColor}
                    buttonType="text"
                    okButtonText={"Pay"}
                    modalTitle={"Add New Card"}
                    width={576}
                  >
                    <AddNewCard />
                  </CardModal>
                  <div className={styles.creditsAmount}>Credits amount</div>
                  <Input labelText="Enter amount" />
                  <div>That’s about 800 images on your current plan.</div>
                </p>
              </CardModal>
            </Col>
            <Col span={5}>
              <p className={styles.balanceTitle}>Next charge on {userPlanData.nextChargeDate}</p>
              <p className={styles.balance}>{userPlanData.nextCharge}</p>
              <Button
                className={styles.addCredits}
                label={"Switch to " + switchToPlan}
                type="text"
                labelClassName={styles.buttonLabelColor}
                onClick={switchPlan}
              />
              <CustomModal
                title={"Switch to " + switchToPlan + " subscription"}
                okText={"Switch to " + switchToPlan}
                cancelText="Cancel"
                visible={visible}
                onOk={confirmSwitchPlan}
                onCancel={() => setVisible(false)}
                type="primary"
              >
                <>
                  Switch your {userPlanData.currentPlan} plan from {planDuration} to {switchToPlan} for $240.78. We will
                  charge this card we have on file. Your {switchToPlan} plan will take effect now.
                  <div style={{ marginTop: "20px" }}>{cardDetails()}</div>
                </>
              </CustomModal>
            </Col>
            <Col span={5}>
              <p className={styles.balanceTitle}>
                Crops remaining
                <img src={"/images/help-icon.svg"} className={styles.helpIcon} />
              </p>
              <p className={styles.balance}>{userPlanData.cropsRemaining}</p>
            </Col>
            <Col span={9} className={styles.cardDetailsCol}>
              {cardDetails(true)}
            </Col>
          </Row>

          <div className={styles.recieptHeading}>Receipts</div>
          <div className={styles.divider} />
          {receiptDataArray.map((value, key) => (
            <ReceiptContainer
              key={key}
              receiptDate={value[0]}
              receiptNumber={value[1]}
              receiptAmount={value[2]}
              receiptViewLink={value[3]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
