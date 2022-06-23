import React, { useEffect, useState } from "react";
import { Icon, IconProps } from "./icon";

import IconGoogle from "../../assets/icons/icon-google.svg";
import IconFacebook from "../../assets/icons/icon-facebook.svg";
import IconAmazon from "../../assets/icons/icon-amazon.svg";
import IconHidden from "../../assets/icons/icon-hidden.svg";
import { PropertySafetyFilled } from "@ant-design/icons";
import { PropertyUtil } from "../../utils";

/**
 *
 * @param props
 * @returns
 */
export const HiddenIcon = (props: IconProps) => <Icon component={IconHidden} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const GoogleIcon = (props: IconProps) => <Icon component={IconGoogle} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const FacebookIcon = (props: IconProps) => <Icon component={IconFacebook} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const AmazonIcon = (props: IconProps) => <Icon component={IconAmazon} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export function SVGIcon(props: IconProps) {
  const iconPath: string | undefined = props.src;
  const [iconObj, setIconObj] = useState();

  useEffect(() => {
    import(props.src ? props.src : "").then(obj => setIconObj(obj)).catch(err => setIconObj(IconHidden));
  }, []);

  return <Icon component={iconObj} {...props} />;
}
