import { useMemo } from "react";
import type { sanJuansection2Type } from "~/data/data";

export const useSanJuanSection2 = (sanJuanSection2Text: sanJuansection2Type) => {
  const imageStyle = useMemo(() => {
    const base64Image = sanJuanSection2Text.sectionImage?.preview;
    const defaultImage = "/hero1.webp";

    const imageUrl = base64Image || defaultImage;
    const isBase64 = imageUrl.startsWith("data:image");

    return {
      src: isBase64 ? imageUrl : defaultImage,
    };
  }, [sanJuanSection2Text.sectionImage?.preview]);

  return {
    imageStyle,
  };
};
