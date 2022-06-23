import React, { useState, useEffect, useRef } from "react";
import { LeftPanel } from "../../../../../ui-components/components/left-panel";
import styles from "../../../../../styles/PlansPage.module.css";
import { Breadcrumbs } from "../../../../../ui-components/components/breadcrumb";
import { SETTINGS_PAGE, SETTING_AND_BILLING_PAGE } from "../../../../../lib/navigation/routes";
import PlansContainer from "./PlanContainer";
import { useIntercom } from "react-use-intercom";

export default function SelectPlans() {
  const divRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLImageElement>(null);
  const prevRef = useRef<HTMLImageElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [planDuration, setPlanDuration] = useState("Monthly");
  let breadcrumbPathArray = [["Settings", SETTINGS_PAGE], ["Billing", SETTING_AND_BILLING_PAGE], ["Select a Plan"]];
  const { showArticle } = useIntercom();

  const handleSelectPlan = (id: number) => {
    showArticle(id);
  };

  let dataArray = [
    {
      planName: "Free",
      planRate: "$0",
      planLevel: 1,
      planDesc: [
        "Up to 10 free crops",
        "Unlimited automations",
        "Unlimited downloads",
        "Full access to Smart Crop",
        "7 days free storage"
      ],
      isCurrentplan: false,
      isRecommended: false
    },
    {
      planName: "Essential",
      planRate: "$25",
      planLevel: 2,
      planDesc: [
        "Up to 100 crops",
        "$0.25 per crop after limit",
        "Unlimited automations",
        "Unlimited downloads",
        "Full access to Smart Crop",
        "6 months free storage"
      ],
      isCurrentplan: true,
      isRecommended: true
    },
    {
      planName: "Studio",
      planRate: "$200",
      planLevel: 3,
      planDesc: [
        "Up to 1,000 crops",
        "$0.20 per crop after limit",
        "Unlimited automations",
        "Unlimited downloads",
        "Full access to Smart Crop",
        "6 months free storage"
      ],
      isCurrentplan: false,
      isRecommended: false
    },
    {
      planName: "Enterprise",
      planRate: "$1500",
      planLevel: 4,
      planDesc: ["Up to 10,000 crops", "$0.15 per crop after limit"],
      isCurrentplan: false,
      isRecommended: false
    }
  ];

  let currentPlan = { currentPlanName: "", currentPlanLevel: 0 };
  let abc = dataArray.map(value => {
    if (value.isCurrentplan) {
      currentPlan.currentPlanLevel = value.planLevel;
      currentPlan.currentPlanName = value.planName;
    }
  });

  let goToNextPlan = () => {
    if (null !== divRef.current && null !== prevRef.current && null !== nextRef.current) {
      divRef.current.style.transform = "translate(-384px)";
      prevRef.current.style.display = "block";
      nextRef.current.style.display = "none";
    }
  };
  let goToPreviousPlan = () => {
    if (null !== divRef.current && null !== prevRef.current && null !== nextRef.current) {
      divRef.current.style.transform = "translate(0px)";
      prevRef.current.style.display = "none";
      nextRef.current.style.display = "inline-block";
    }
  };

  let setAnnual = () => {
    if (null !== sliderRef.current) {
      setPlanDuration("Annual");
      sliderRef.current.style.transform = "translate(106px)";
    }
  };
  let setMonthly = () => {
    if (null !== sliderRef.current) {
      setPlanDuration("Monthly");
      sliderRef.current.style.transform = "translate(0px)";
    }
  };
  let onPlanUpgrade = () => {};

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%", overflow: "scroll" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>

        <div className={styles.headingContainer}>
          <div className={styles.heading}>Select a Plan</div>

          <div className={styles.selectorButton}>
            <div ref={sliderRef} className={styles.sliderDiv} />
            <div className={styles.firstOption} onClick={setMonthly}>
              Monthly
            </div>
            <div className={styles.secondOption} onClick={setAnnual}>
              Annual
            </div>
          </div>
        </div>
        <div className={styles.divider} />

        <div className={styles.planCarouselContainer}>
          <div className={styles.planCarousel} ref={divRef}>
            {dataArray !== undefined
              ? dataArray.map((value, key) => (
                  <PlansContainer
                    key={key}
                    planName={value.planName}
                    planRate={value.planRate}
                    planDescriptionArray={value.planDesc}
                    planDuration={planDuration}
                    currentPlan={value.isCurrentplan}
                    recommended={value.isRecommended}
                    currentPlanLevel={currentPlan}
                    planLevel={value.planLevel}
                    onSelectPlan={handleSelectPlan}
                  />
                ))
              : null}
          </div>
          <img
            ref={prevRef}
            src={"/images/previous-icon.svg"}
            onClick={goToPreviousPlan}
            className={styles.previousIcon}
          />
          <img ref={nextRef} src={"/images/nextarrow-icon.svg"} onClick={goToNextPlan} className={styles.nextIcon} />
        </div>
      </div>
    </div>
  );
}
