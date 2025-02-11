// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection2Type } from "~/data/data";
import { Review } from "~/data/data";
import { Avatar } from "rsuite";
import { Rate } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { Carousel } from "rsuite";
import { motion } from "framer-motion";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  indexSection2Text: IndexSection2Type;
  carouselIndexSection2: Review[];
};

const IndexSection2: React.FC<ChildProps> = ({ width, indexSection2Text, carouselIndexSection2 }) => {
  return (
    <div className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-20 mx-auto relative z-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full max-w-[1020px] p-6 relative flex flex-col justify-center items-center gap-8"
      >
        <div className="text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className={`
              font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent
              ${width <= 450 ? "text-3xl" : "text-4xl"}
            `}
          >
            {indexSection2Text.firstH2}
          </motion.h2>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className={`
              text-blue-800
              ${width <= 450 ? "text-2xl" : "text-3xl"}
            `}
          >
            {indexSection2Text.secondH2}
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="w-full mt-4"
        >
          <Carousel 
            autoplay 
            shape="none"
            autoplayInterval={3500} 
            className="custom-slider" 
            style={{ 
              background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
              padding: "24px",
              borderRadius: "24px",
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: "auto",
            }}
          >
            {carouselIndexSection2.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
                  width: "100%",
                  height: "450px",
                }}
                className="flex flex-col items-center justify-center p-28 rounded-2xl shadow-lg space-y-6 "
              >
                {/* Avatar and Reviewer Info */}
                <div className="flex flex-row gap-6 items-center">
                  <Avatar 
                    circle 
                    size="lg"
                    style={{ 
                      background: "#1e3a8a",
                      fontSize: "1.5rem",
                      fontWeight: "bold"
                    }}
                  >
                    {review.avatar}
                  </Avatar>
                  <div className="flex flex-col items-start justify-start">
                    <h3 className="text-xl font-semibold text-blue-900">
                      {review.name} <span className="text-blue-400 mx-2">•</span> {review.country}
                    </h3>
                    <p className="text-blue-600">{review.date}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="my-2">
                  <Rate defaultValue={5} readOnly size="lg" color="rgb(29, 78, 216)" />
                </div>

                {/* Review Text */}
                <div className="max-w-2xl">
                  <p className="text-lg text-blue-800 leading-relaxed italic">
                    "{review.reviewText}"
                  </p>
                </div>

                {/* Review Site Reference */}
                <div className="pt-4">
                  <a 
                    href={review.reviewLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-2"
                  >
                    {review.reviewLinkSite}
                  </a>
                </div>
              </motion.div>
            ))}
          </Carousel>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IndexSection2;
