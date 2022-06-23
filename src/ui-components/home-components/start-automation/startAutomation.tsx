import React from "react";
import "antd/dist/antd.css";
import classnames from "classnames";
import styles from "./startAutomation.module.scss";
import { Header } from "../../components/header";
import { Card, CardProps } from "../../components/card";

export type StartAutomationProps = {
  /**
   * array of option to show
   */
  automationOptions: Array<CardProps>;
  /**
   * heading for the panel
   */
  heading: string;
  /**
   * style fo inline CSS
   */
  style?: Object;
  /**
   * classname to override CSS
   */
  className?: string;
};

export function StartAutomation({ automationOptions = [], heading, style, className }: StartAutomationProps) {
  return (
    <div className={classnames(className, styles.startAutomation)}>
      <Header className={styles.headingContainer} headerClass={styles.cropHeading} text={heading} />
      <div className={styles.cropList} data-cy="crop-list">
        {automationOptions.map(item => {
          return (
            <div data-cy="automation-option-card">
              <Card
                id={item.id}
                key={item.id}
                icon={item.icon}
                title={item.title}
                description={item.description}
                disabled={item.disabled}
                onClick={item.onClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
