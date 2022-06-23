import React, { ChangeEvent, useEffect, useState } from "react";
import { Elements, CardElement, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../ui-components/components/button";
import { GET } from "../../../util/auth/Authenticator";
import { Label } from "../../../ui-components/components/label";
import { Input } from "../../../ui-components/components/input";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";
import { LOGIN_PAGE, redirectToPath } from "../../../lib/navigation/routes";
import { Logger } from "aws-amplify";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51JPOZ2HWOOtEmJG7zmv0vDHlJIiOcTC8X1AMnTJkoJC9XkTrrVJn0c3yvAypTXlLxePia2yXCJp0bv4OkbxT9NyM005ta7HfkT"
);
const logger = new Logger("pages:user:billing:Billing");
export default function Billing() {
  const [apiEndPoint, setAPIEndPoint] = useState<any>("/api/v1/stripe/newCustomer");
  const [apiResponse, setAPIResponse] = useState<any>("");
  const router = useRouter();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    logger.debug("in use effect of settings page");
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        setIsLoaded(true);
      } else {
        redirectToPath(LOGIN_PAGE, router, window);
      }
    });
  }, [router, user]);

  function saveCard() {
    let setupIntentSecret = createNewCustomer();
    console.log(setupIntentSecret);
  }

  function createNewCustomer() {
    /*GET(apiEndPoint, cognitoUserSession, null)
      .then(response => {
        console.log(response);
        setAPIResponse("");
        createSetupIntent();
      })
      .catch(error => {
        setAPIResponse({ apiResponse: error }); //TODO: change this to string later
      });*/
  }

  function createSetupIntent() {}

  const options = {
    // passing the client secret obtained in step 2
    clientSecret: "seti_1Jx88EHWOOtEmJG7R9wMqGkA_secret_KcMrl8hLOu9046dsAj0jain3UHGEcb8"
    // Fully customizable with appearance API.
    // appearance: { theme: 'flat'},
  };
  const style = {
    base: {
      iconColor: "#c4f0ff",
      color: "#fff",
      fontWeight: "500",
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      ":-webkit-autofill": {
        color: "#fce883"
      },
      "::placeholder": {
        color: "#87BBFD"
      }
    },
    invalid: {
      iconColor: "#FFC7EE",
      color: "#FFC7EE"
    }
  };

  return (
    <div style={{ width: "550px", margin: "100px" }}>
      <Elements stripe={stripePromise} options={options}>
        <h2>
          <Label labelText="Add a Credit Card" />
        </h2>
        <div style={{ width: "365px" }}>
          <Label labelText="First Name" customizeClassName={styles.labelFirstName} />
          <Label labelText="Last Name" customizeClassName={styles.labelLastName} />
        </div>
        <Input customizeClassName={styles.inputBoxFirstName} />
        <Input customizeClassName={styles.inputBoxLastName} />
        <div style={{ width: "395px" }}>
          <Label labelText="Credit Card" customizeClassName={styles.labelFirstName} />
          <Label labelText="Billing Zip Code" customizeClassName={styles.labelLastName} />
        </div>
        <CardElement />
        <Button className={styles.stripeButton} onClick={() => saveCard()} label="Save" />
        {/*<Button className={styles.stripeButton} label="Create new Customer"/>*/}
      </Elements>
    </div>
  );
}
// let styles = {
//   inputBox: {
//   width: '250px',
//     backgroundColor: 'pink',
//   },
//   button: {
//     backgroundColor: 'pink'
//   }
// };
