// app/reducers/LanguageReducer.tsx
import languageData from "~/data/data.json";

// Define the type for language data structure
export type LanguageData = typeof languageData.en;

// Define the types of the reducer state and action
export type State = LanguageData;

export type Action = { type: "changeLanguage"; payload: string } | { type: undefined };

// Reducer function
export const languageReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "changeLanguage":
      return languageData[action.payload as keyof typeof languageData] || state;
    default:
      return state;
  }
};
