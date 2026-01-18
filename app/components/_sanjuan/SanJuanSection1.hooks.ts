import { useMemo } from "react";
import type { sanJuanSection1Type } from "~/data/data";

export const useSanJuanSection1 = (sanJuanSection1Text: sanJuanSection1Type) => {
  const backgroundStyle = useMemo(() => {
    const base64Image = sanJuanSection1Text.backgroundImage?.preview;
    const defaultImage = "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public/olgaphoto3.jpeg";

    // Use the image from MongoDB if it exists, otherwise use default
    const imageUrl = base64Image || defaultImage;

    return {
      backgroundImage: `url(${imageUrl})`,
    };
  }, [sanJuanSection1Text.backgroundImage?.preview]);

  return {
    backgroundStyle,
  };
};
