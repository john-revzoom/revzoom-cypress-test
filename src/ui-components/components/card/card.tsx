import React, { ReactChild } from "react";

//Import CSS
import classnames from "classnames";
//@ts-ignore
import styles from "./card.module.scss";
import { Header } from "../header";

export type CardProps = {
  /**
   * unique Id for keys
   */
  id: string;
  /**
   *
   */
  className?: string;
  /**
   * Icon's path as string'
   */
  icon: string;
  /**
   * Title of the card
   */
  title: string;
  /**
   * description or the sub-title of the card
   */
  description: string;
  /**
   * Custom Styles.
   */
  style?: Object;
  /**
   * Custom Styles.
   */
  disabled?: Boolean;
  /**
   * onClick function.
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

/**
 *
 * @param param0
 * @returns
 */
export function Card({ className, icon = " ", title = " ", description = " ", disabled = false, onClick }: CardProps) {
  return (
    <div
      className={classnames(styles.card, className, disabled ? styles.disabled : "")}
      onClick={onClick}
      data-cy="card"
    >
      <div className={styles.cardIconContainer}>
        <img src={icon} />
      </div>
      <Header
        className={styles.cardHeaderContainer}
        headerClass={styles.cardHeader}
        subHeaderClass={styles.cardDescription}
        text={title}
        subText={description}
      />
    </div>
  );
}
