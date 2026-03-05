import { useMemo } from "react";
import type { sanJuansection2Type } from "~/data/data";

export const useSanJuanSection2 = (sanJuanSection2Text: sanJuansection2Type) => {
  const imageSrc = useMemo(() => {
    const removedImage = sanJuanSection2Text.sectionImage === null || sanJuanSection2Text.sectionImage?.preview === "";
    if (removedImage) {
      return null;
    }

    const base64Image = sanJuanSection2Text.sectionImage?.preview;
    const defaultImage = "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public/hero1.webp";

    // Use the image from MongoDB if it exists, otherwise use default
    return base64Image || defaultImage;
  }, [sanJuanSection2Text.sectionImage]);

  return {
    imageSrc,
    hasImage: Boolean(imageSrc),
  };
};
