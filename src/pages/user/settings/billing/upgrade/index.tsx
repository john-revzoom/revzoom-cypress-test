import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "../../../../../ui-components/components/breadcrumb";
import styles from "../../../../../styles/Upgrade.module.css";
import { SETTINGS_PAGE } from "../../../../../lib/navigation/routes";
import { Button } from "../../../../../ui-components/components/button";
import { ContentCard } from "../../../../../ui-components/components/content-card";
import InvoiceListItem from "../Invoice";
import { Checkbox, Row, Col, Skeleton } from "antd";
import { Input } from "../../../../../ui-components/components/input";
import CardModal from "../CardModal";
import { LeftPanel } from "../../../../../ui-components/components/left-panel";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AddStripeCard from "../AddStripeCard";
import { FastForwardFilled } from "@ant-design/icons";
import { CustomModal } from "../../../../../ui-components/components/modal";

const stripePromise = loadStripe(
  "pk_test_51JPOZ2HWOOtEmJG7zmv0vDHlJIiOcTC8X1AMnTJkoJC9XkTrrVJn0c3yvAypTXlLxePia2yXCJp0bv4OkbxT9NyM005ta7HfkT"
);

export default function Billing() {
  let creditCardSaved: boolean = true;
  let invoicesPresent: boolean = false;
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  let breadcrumbPathArray = [["Settings", SETTINGS_PAGE], ["Billing"]];
  let [dummyInvoiceData, setDummyInvoiceData] = useState([["", "", ""]]);
  const [cardSetupInfo, setCardSetupInfo] = useState("");
  const [amountDue, setAmountDue] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setDummyInvoiceData([
        ["Oct 14 2021 to Today", "$240", "In Progress"],
        ["Oct 14 2021", "$80", "Paid"],
        ["Aug 14 2021", "$40", "Paid"],
        ["Jul 14 2021", "$200", "Paid"],
        ["May 14 2021", "$1200", "Paid"],
        ["Apr 14 2021", "$564", "Paid"],
        ["Feb 14 2021", "$8643", "Paid"],
        ["Jan 14 2021", "$536", "Paid"]
      ]);
      setLoaded(true);
      if (creditCardSaved) setCardSetupInfo("You will be charged on a card ending in **** 8493");
      else setCardSetupInfo("No credit card setup");
      setAmountDue("0$");
    }, 5000);
  }, [1]);

  const onRemoveCreditCard = () => {
    setVisible(true);
  };

  const onClickOfRemoveButton = () => {
    setVisible(false);
  };

  const options = {
    clientSecret: "seti_1Jx88EHWOOtEmJG7R9wMqGkA_secret_KcMrl8hLOu9046dsAj0jain3UHGEcb8"
  };
  const AddCreditCardModalBody = () => {
    return (
      <div
        style={{
          height: "22vh",
          display: "flex"
        }}
      >
        <Elements stripe={stripePromise} options={options}>
          <AddStripeCard />
        </Elements>
      </div>
    );
  };

  const OneTimePayModalBody = () => {
    function onChangeSaveAsDefaultCC() {
      // console.log(`checked = ${e.target.checked}`);
    }
    return (
      <>
        {AddCreditCardModalBody()}
        <div className={styles.amount}>Amount</div>
        <div className={styles.amountInputField}>
          <Input />
        </div>
        <Checkbox className={styles.checkbox} onChange={onChangeSaveAsDefaultCC}>
          Save as default credit card
          <span className={styles.checkboxSubText}>(this will remove your current credit card)</span>
        </Checkbox>
      </>
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%" }}>
        <Breadcrumbs pathArray={breadcrumbPathArray} />

        <Row>
          <Col span={16}>
            <div className={styles.billingPageLeftContainer}>
              <h1 className={styles.billingPageHeaderContainer}>
                <span>Billing</span>
              </h1>
              <div className={styles.billingPageDivider} />

              {!loaded ? (
                <div className={styles.SkeletonContainer}>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ) : !creditCardSaved ? (
                <ContentCard
                  title={"No credit card setup"}
                  description={"You will need to add a credit card to be able to fully use Evolphin Cloud."}
                  icon={"/images/card-icon.svg"}
                >
                  <CardModal
                    okButtonText={"Save"}
                    buttonText={"Add Credit Card"}
                    buttonClassname={styles.billingPageAddCreditCardContainer}
                    buttonLabelClassName={styles.addCreditCardLabel}
                    modalTitle="Add a credit card"
                  >
                    {AddCreditCardModalBody()}
                  </CardModal>
                </ContentCard>
              ) : null}

              {!loaded ? (
                <div className={styles.SkeletonContainer}>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ) : invoicesPresent ? (
                <div>
                  {dummyInvoiceData !== undefined
                    ? dummyInvoiceData.map((value, key) => (
                        <InvoiceListItem date={value[0]} status={value[2]} amount={value[1]} key={key} />
                      ))
                    : null}
                </div>
              ) : (
                <ContentCard
                  title={"No invoices"}
                  description={"You don’t have any invoices at the moment. Once you do they will appear here."}
                  icon={"/images/invoice-icon.svg"}
                />
              )}
            </div>
          </Col>
          {/*
           *Right Panel
           */}
          <Col span={8}>
            <div className={styles.billingPageRightContainer}>
              {!loaded ? (
                <div className={styles.SkeletonContainer}>
                  <Skeleton active paragraph={{ rows: 6 }} />
                </div>
              ) : (
                <div className={styles.billingPageRightContainerBox}>
                  <div className={styles.billingPageAmountContainer}>
                    <div className={styles.billingPageAmountTitleContainer}>
                      <div className={styles.amountDueTitle}>Amount due</div>
                      <img src={"/images/amount-icon.svg"} className={styles.iconColor2} />
                    </div>
                    <div className={styles.price}>{amountDue}</div>
                  </div>
                  <div className={styles.divider1} />
                  <div className={styles.creditCardContainer}>
                    <div className={styles.creditCardTitle}>Credit card</div>
                    <div className={styles.noCardSetupTitle}>
                      <div style={{ marginBottom: "16px" }}>{cardSetupInfo}</div>
                      {creditCardSaved ? (
                        <Button
                          className={styles.oneTimePaymentAction}
                          label={"Remove credit card"}
                          labelClassName={styles.label}
                          onClick={onRemoveCreditCard}
                        />
                      ) : null}
                      <CustomModal
                        title="Remove credit card"
                        okText="Remove"
                        cancelText="Cancel"
                        visible={visible}
                        onOk={onClickOfRemoveButton}
                        onCancel={() => setVisible(false)}
                        type="danger"
                      >
                        <p>
                          Are you sure you want to remove your credit card? You will no longer have access to paid
                          features.
                        </p>
                      </CustomModal>
                    </div>
                  </div>
                  <div className={styles.divider1} />
                  <div className={styles.billingPageOneTimePaymentContainer}>
                    <div className={styles.billingPageOneTimePaymentInnerContainer}>
                      <div className={styles.oneTimePaymentTitle}>One time payment</div>
                      <p className={styles.oneTimePaymentDescription}>
                        Make a one time payment to clear a pending balance or add account credits.
                      </p>
                    </div>

                    <CardModal
                      buttonText={"Make a one time payment"}
                      buttonClassname={styles.oneTimePaymentAction}
                      buttonLabelClassName={styles.label}
                      okButtonText={"Pay"}
                      modalTitle="Make a one time payment"
                    >
                      {OneTimePayModalBody()}
                    </CardModal>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
