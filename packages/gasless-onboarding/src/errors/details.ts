import { ErrorTypes } from "./types";

export const ERROR_DETAILS: { [error in ErrorTypes]: string } = {
  UnsupportedNetwork: "Network is not supported",
  OnboardingNotInitiated: "Onboarding is not initiated",
  LoginFailed: "Login attempt failed",
  NotLoggedIn: "The user is not logged in",
  ServerError: "Unable to process your request",
};
