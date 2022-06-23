import React, { useState } from "react";
import styles from "../../../../styles/ReceiptContainer.module.css";
import { Col, Row } from "antd";

export type ReceiptContainerProps = {
  /**
   *
   */
  receiptDate: string;
  receiptNumber: string;
  receiptAmount: string;
  receiptViewLink: string;
};

export default function ReceiptContainer({
  receiptDate,
  receiptNumber,
  receiptAmount,
  receiptViewLink
}: ReceiptContainerProps) {
  return (
    <>
      <div className={styles.receiptContainer}>
        <Row>
          <Col span={5}>
            <div className={styles.recieptInfo}>{receiptDate}</div>
          </Col>
          <Col span={5}>
            <div className={styles.recieptInfo}>{receiptNumber}</div>
          </Col>
          <Col span={9}></Col>
          <Col span={3}>
            <div className={styles.recieptAmount}>{receiptAmount}</div>
          </Col>
          <Col span={2}>
            <a className={styles.viewReciept} href={receiptViewLink}>
              View
            </a>
          </Col>
        </Row>
      </div>
    </>
  );
}
