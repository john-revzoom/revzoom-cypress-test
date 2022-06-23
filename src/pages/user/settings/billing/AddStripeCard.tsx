// @ts-ignore
import React from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "../../../../styles/AddNewCard.module.css";
import { Input } from "../../../../ui-components/components/input";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51JPOZ2HWOOtEmJG7zmv0vDHlJIiOcTC8X1AMnTJkoJC9XkTrrVJn0c3yvAypTXlLxePia2yXCJp0bv4OkbxT9NyM005ta7HfkT"
);

const Wrapper = (props: any) => (
  <Elements stripe={stripePromise}>
    <AddStripeCard {...props} />
  </Elements>
);

export default Wrapper;

function AddStripeCard() {
  const stripe = useStripe();

  // const elements = useElements();

  function saveCard() {
    let setupIntentSecret = createNewCustomer();
    console.log(setupIntentSecret);
  }

  function createNewCustomer() {}

  function createSetupIntent() {}

  const options = {
    clientSecret: "seti_1Jx88EHWOOtEmJG7R9wMqGkA_secret_KcMrl8hLOu9046dsAj0jain3UHGEcb8"
    // Fully customizable with appearance API.
    // appearance: { theme: 'flat'},
  };
  const appearance = {
    theme: "stripe",

    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Ideal Sans, system-ui, sans-serif",
      spacingUnit: "2px",
      borderRadius: "4px"
      // See all possible variables below
    }
  };
  const clientSecret = "seti_1Jx88EHWOOtEmJG7R9wMqGkA_secret_KcMrl8hLOu9046dsAj0jain3UHGEcb8";

  // const elements = stripe.elements({ clientSecret, appearance });

  return (
    <>
      <div style={{ display: "inline-block", width: "50%" }}>
        <div className={styles.firstNameTitle}>First Name</div>
        <div className={styles.firstName}>
          <Input />
        </div>
        <div className={styles.firstNameTitle}>Credit Card</div>
        <div style={{ width: "503px" }} className={styles.firstName}>
          <CardElement />
        </div>
      </div>

      <div style={{ display: "inline-block", width: "50%" }}>
        <div className={styles.lastNameTitle}>Last Name</div>
        <div className={styles.lastName}>
          <Input />
        </div>
        {/* <div className={styles.lastNameTitle}>
            Billing ZIP Code
          </div> */}
        {/* <div className={styles.lastName}>
            <Input />
          </div> */}
      </div>
    </>
  );
}
