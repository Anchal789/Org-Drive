import { VerifyAction, VerifyState } from "@/types/auth";

export const initialVerifyState: VerifyState = {
  status: "entering_otp",
  serverError: null,
  passwordHint: null,
};

export function verifyReducer(
  state: VerifyState,
  action: VerifyAction,
): VerifyState {
  switch (action.type) {
    case "submit_start":
      return { ...state, serverError: null };
    case "error":
      return { ...state, serverError: action.message };
    case "needs_password":
      return {
        ...state,
        status: "needs_password",
        passwordHint: action.passwordHint,
      };
    case "success":
      return { ...state, status: "success" };
    default:
      return state;
  }
}
