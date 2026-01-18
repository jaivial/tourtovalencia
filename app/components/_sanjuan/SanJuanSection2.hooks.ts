import { useMemo } from "react";
import type { sanJuansection2Type } from "~/data/data";

export const useSanJuanSection2 = (sanJuanSection2Text: sanJuansection2Type) => {
  const imageStyle = useMemo(() => {
    const base64Image = sanJuanSection2Text.sectionImage?.preview;
    const defaultImage = "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public/hero1.webp";

    // Use the image from MongoDB if it exists, otherwise use default
    const imageUrl = base64Image || defaultImage;

    return {
      src: imageUrl,
    };
  }, [sanJuanSection2Text.sectionImage?.preview]);

  return {
    imageStyle,
  };
};
