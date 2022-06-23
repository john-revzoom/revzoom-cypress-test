import React, { useState } from "react";
import styles from "../../../../../styles/PlanContainer.module.css";
import "antd/dist/antd.css";
import { Button } from "../../../../../ui-components/components/button";
import CardModal from "../CardModal";
import AddNewCard from "../AddNewCard";
import { Dropdown } from "../../../../../ui-components/components/dropdown";
import classNames from "classnames";

export default class PlanContainer extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {};
  }
  render() {
    let {
      planName,
      planRate,
      planLevel,
      planDescriptionArray = [],
      currentPlan,
      recommended,
      planDuration,
      currentPlanLevel
    } = this.props;

    let planType = currentPlanLevel.currentPlanLevel > planLevel ? "Downgrade" : "Upgrade";
    let dropdownLabel = "Select a reason";
    let userCardData = {
      cardType: "mastercard",
      cardDigits: "**** 3839",
      cardExpiry: "10/24"
    };
    const noReasonSelect = () => {};
    const noCropsNeeded = () => {};

    let dropdownItems = [
      {
        id: "no need",
        label: "I no longer need crops for some time.",
        onClick: noCropsNeeded
      },
      {
        id: "no reason",
        label: "No Reason",
        onClick: noReasonSelect
      }
    ];

    return (
      <>
        <div className={styles.planContainer}>
          {recommended ? <img src={"/images/recommended.svg"} className={styles.recommended} /> : null}
          <div className={styles.planName}>{planName}</div>
          <div className={styles.planRate}>
            {planRate}
            {planName !== "Free" ? (
              <div className={styles.planDuration}>{planDuration === "Monthly" ? "per month" : "per year"}</div>
            ) : null}
          </div>
          {planDescriptionArray !== undefined
            ? planDescriptionArray.map((value: string, key: string) => (
                <div key={key} className={styles.descItems}>
                  {value}
                </div>
              ))
            : null}
          <div style={{ position: "absolute", bottom: "60px", display: "inline-block" }}>
            {!currentPlan ? (
              <CardModal
                buttonText={planType == "Downgrade" ? "Downgrade to " + planName : "Upgrade to " + planName}
                buttonClassname={planType == "Downgrade" ? styles.downgradeType : styles.planStatus}
                buttonLabelClassName={planType == "Downgrade" ? styles.downgradeTypeLabel : ""}
                okButtonText={planType == "Downgrade" ? "Downgrade to Free" : "Pay"}
                modalTitle={
                  planType == "Downgrade"
                    ? "Downgrade from " + currentPlanLevel.currentPlanName + " to " + planName
                    : "Upgrade to " + planName
                }
                width={600}
                danger={planType == "Downgrade"}
              >
                {planType == "Downgrade" ? (
                  <div>
                    <p className={styles.topMsg}>
                      Are you sure you want to downgrade for {currentPlanLevel.currentPlanName} to {planName}? Once your
                      plan ends your credit card data will be removed from our secured servers.
                    </p>
                    <div className={styles.reasonHeader}>
                      Reason<div className={styles.asterix}>*</div>
                    </div>

                    {/* {dropdownItems != undefined ?
                      <Select style={{ width: 552 }} placeholder="Select a reason" >
                        {dropdownItems.map((value, key) => {
                          <option value={value.id}>{value.label}</option>
                        })}
                      </Select>
                      : null } */}
                    <Dropdown
                      label={dropdownLabel}
                      dropdownClassName={styles.dropdownClassName}
                      triggerOn="click"
                      dropdownItems={dropdownItems}
                      className={styles.dropdownList}
                    />
                    <p className={styles.bottomMsg}>You can still use your essential plan until Nov 1, 2022.</p>
                  </div>
                ) : userCardData ? (
                  <AddNewCard planRate={planRate} />
                ) : (
                  <AddNewCard />
                )}
              </CardModal>
            ) : (
              <Button type="primary" className={styles.planCurrent} label="Current Plan" />
            )}
          </div>
          <div style={{ position: "absolute", bottom: "0px", display: "inline-block" }}>
            <Button
              type="text"
              className={styles.learnMore}
              label={"Learn more"}
              labelClassName={classNames(styles.learnMoreLabel, "bot-launch-plans-information")}
              onClick={() => this.props.onSelectPlan(6031196)}
            />
          </div>
        </div>
      </>
    );
  }
}
