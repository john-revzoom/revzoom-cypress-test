import React from "react";
import classnames from "classnames";
import styles from "./navigationList.module.scss";
import "antd/dist/antd.css";
import { Button, PrimaryButton, ButtonProps } from "../../../button";

export type NavigationListItemProps = ButtonProps & {
  selected: boolean;
  dataCy: string;
};

export type NavigationListProps = {
  /**
   * Navigation List Array
   */
  navigationList: Array<NavigationListItemProps>;
  bottomItems: Array<React.ReactNode>;
};

export function NavigationListItem(item: NavigationListItemProps) {
  return (
    <PrimaryButton
      id={styles.navigationButton}
      key={item.label}
      className={classnames(item.className, item.selected ? styles.selected : "")}
      icon={item.icon}
      label={item.label}
      onClick={item.onClick}
      dataCy={item.dataCy}
    />
  );
}

//TO-DO: Need to make this component proper to take items as props. Before that required an unified Image component
export function NavigationList({ navigationList = [], bottomItems = [] }: NavigationListProps) {
  return (
    <div className={styles.navigationContainer}>
      {navigationList.map(item => {
        return <NavigationListItem key={item.label} {...item} />;
      })}
      <div className={styles.bottomItems}>
        {bottomItems.map(function (item, index) {
          return item;
        })}
      </div>
    </div>
  );
}
