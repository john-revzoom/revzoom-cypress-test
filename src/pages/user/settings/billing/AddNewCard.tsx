import React, { useState } from "react";
import styles from "../../../../styles/AddNewCard.module.css";
import { Elements } from "@stripe/react-stripe-js";
import AddStripeCard from "./AddStripeCard";
import { Checkbox, Input } from "antd";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51JPOZ2HWOOtEmJG7zmv0vDHlJIiOcTC8X1AMnTJkoJC9XkTrrVJn0c3yvAypTXlLxePia2yXCJp0bv4OkbxT9NyM005ta7HfkT"
);

export type AddNewCardProps = {
  /**
   *
   */
  planRate?: string;
  paymentRequired?: boolean;
};

export default function AddNewCard({ planRate, paymentRequired = true }: AddNewCardProps) {
  const options = {
    clientSecret: "seti_1Jx88EHWOOtEmJG7R9wMqGkA_secret_KcMrl8hLOu9046dsAj0jain3UHGEcb8"
  };
  function onChangeSaveAsDefaultCC() {
    // console.log(`checked = ${e.target.checked}`);
  }
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

  return (
    <>
      {AddCreditCardModalBody()}
      {paymentRequired ? (
        <>
          <div className={styles.amount}>Amount</div>
          <div className={styles.amountInputField}>{planRate ? <p>{planRate}</p> : <Input />}</div>
          <Checkbox className={styles.checkbox} onChange={onChangeSaveAsDefaultCC}>
            Save as default credit card
            <span className={styles.checkboxSubText}>(this will remove your current credit card)</span>
          </Checkbox>
        </>
      ) : null}
    </>
  );
}
