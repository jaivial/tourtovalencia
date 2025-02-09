// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection2Type } from "~/data/data";
import { Review } from "~/data/data";
import { AvatarGroup, Avatar } from "rsuite";
import { Rate } from "rsuite";
// entry.client.tsx
import "rsuite/dist/rsuite.min.css";
import { Carousel } from "rsuite";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  indexSection2Text: IndexSection2Type;
  carouselIndexSection2: Review[];
};

const IndexSection2: React.FC<ChildProps> = ({ width, height, indexSection2Text, carouselIndexSection2 }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto ${width <= 450 ? "gap-0" : "gap-10"} relative z-0`}>
      <div className={`w-full max-w-[1020px] h-[600px] p-6 relative flex flex-col justify-center items-center`}>
        <h2 className="text-blue-950">{indexSection2Text.firstH2}</h2>
        <h2 className="text-blue-950">{indexSection2Text.secondH2}</h2>
        <div className={`w-full mt-4`}>
          <Carousel autoplay shape="dot" autoplayInterval={2500} className="custom-slider" style={{ backgroundColor: "#93c5fd", padding: "20px", borderRadius: "20px" }}>
            {carouselIndexSection2.map((review, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#eff6ff",
                  width: "100%",
                }}
                className="flex flex-col items-center justify-center p-[100px]"
              >
                {/* Avatar and Reviewer Info */}
                <div className="flex flex-row gap-4 items-center">
                  <Avatar circle style={{ background: "#000" }}>
                    {review.avatar}
                  </Avatar>
                  <div className="flex flex-col items-start justify-start">
                    <h3>
                      {review.name} <span>-</span> {review.country}
                    </h3>
                    <p>{review.date}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="my-4">
                  <Rate defaultValue={5} size="lg" />
                </div>

                {/* Review Text */}
                <div>
                  <p className="text-[1.2rem]">{review.reviewText}</p>
                </div>

                {/* Review Site Reference */}
                <div className="pt-4">
                  <a href={review.reviewLink} className="text-[1.2rem]">
                    {review.reviewLinkSite}
                  </a>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default IndexSection2;
