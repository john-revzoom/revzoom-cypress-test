import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from '@datadog/browser-logs';

export function getEnv() {
  if (typeof window !== "undefined") {
    if (window && window.location) {
      const hostname = window.location.hostname.toLowerCase().trim();
      if (hostname === "app.crop.photo" || hostname === "app.prod.crop.photo") {
        return "prod";
      } else if (hostname === "app.beta.crop.photo") {
        return "beta";
      } else if (hostname === "app.daisy.crop.photo") {
        return "daisy";
      } else if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "local-dev"
      } else {
        if (hostname.startsWith("app.") && hostname.endsWith(".crop.photo")) {
          const split = hostname.split(".");
          if (split) {
            if (split.length > 1) {
              return split[1];
            }
          }
        }
      }
    }
    console.warn("Unknown host name for datadog logging. hostname:", window.location.hostname)
  }
  return "unknown-host";
}

let env = getEnv()
let applicationId: string
let clientToken: string

if (env === "daisy") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_DAISY as string
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_DAISY as string
} else if (env === "beta") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_BETA as string
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_BETA as string
} else if (env === "prod") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_PROD as string
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_PROD as string
}

export const initializeDatadog = () => {

  if (process.env.NODE_ENV === "production") {
    datadogRum.init({
      applicationId: applicationId,
      clientToken: clientToken,
      site: "datadoghq.com",
      service: "app.daisy.crop",
      // Specify a version number to identify the deployed version of your application in Datadog
      // version: '1.0.0',
      sampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: "mask-user-input",
      trackSessionAcrossSubdomains: true,
      env: env
    });

    console.log("Datalog RUM setup done :", env, "Tokens present: ", !!applicationId, !!clientToken);
    datadogRum.startSessionReplayRecording();
  }
};

export const initializeDatadogLogs = () => {
  if (process.env.NODE_ENV === "production") {
    datadogLogs.init({
      clientToken: clientToken,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      service: "app.daisy.crop",
      sampleRate: 100,
      env: getEnv(),
      trackSessionAcrossSubdomains: true,
    });
    const env = getEnv();
    console.log("Datalog log setup done for:", env, "Tokens present: ", !!applicationId, !!clientToken)
  }
}