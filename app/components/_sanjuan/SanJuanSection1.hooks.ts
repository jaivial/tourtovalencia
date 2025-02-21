import { useMemo } from "react";
import type { sanJuanSection1Type } from "~/data/data";

export const useSanJuanSection1 = (sanJuanSection1Text: sanJuanSection1Type) => {
  const backgroundStyle = useMemo(() => {
    const base64Image = sanJuanSection1Text.backgroundImage?.preview;
    const defaultImage = "/olgaphoto3.jpeg";

    const imageUrl = base64Image || defaultImage;
    const isBase64 = imageUrl.startsWith("data:image");

    return {
      backgroundImage: isBase64 ? `url(${imageUrl})` : `url(${defaultImage})`,
    };
  }, [sanJuanSection1Text.backgroundImage?.preview]);

  return {
    backgroundStyle,
  };
};
