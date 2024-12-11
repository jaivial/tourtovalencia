// app/reducers/LanguageReducer.tsx
import { LanguageData, languages } from "~/data/data";

// Definte the types of the reducer state and action
export type State = LanguageData;

export type Action = { type: "changeLanguage"; payload: string } | { type: undefined };

// Reducer function
export const languageReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "changeLanguage":
      return languages[action.payload] || state;
    default:
      return state;
  }
};
