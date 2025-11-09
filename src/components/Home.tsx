import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/common/Button";
import { useUIStore } from "@/store/useUIStore";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="Home">
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="ribbon top">
            <div className="sec"></div>
          </div>
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            id="HomeLoading"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [1, 1, 1],
              y: [0, -20, 0],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
          >
            <div className="home_box">
              <img src="/starloading.gif" />
              <img src="/yoga.png" width={300} />
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              key="banner"
              id="Banner"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="flex justify-center w-full title">
                <svg viewBox="0 0 500 250">
                  <path
                    id="curve"
                    d="M 50 150 Q 250 50 450 150"
                    fill="transparent"
                    stroke="none"
                  />

                  <text
                    fontSize="80"
                    fontFamily="sans-serif"
                    fill="none"
                    stroke="#213448"
                    strokeWidth="15"
                    letterSpacing="12"
                  >
                    <textPath
                      href="#curve"
                      startOffset="50%"
                      textAnchor="middle"
                      dy="10"
                    >
                      汉语很难啊
                    </textPath>
                  </text>

                  <text
                    fontSize="80"
                    fontFamily="sans-serif"
                    fill="white"
                    letterSpacing="12"
                  >
                    <textPath
                      href="#curve"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      汉语很难啊
                    </textPath>
                  </text>
                </svg>
              </div>

              <div id="Bunny">
                <img src="/bunny.png" />
              </div>
            </motion.div>

            <div className="navi">
              <div className="sec search">
                <img src="/tracuu.png" />
                <Button
                  className="uppercase text-3xl px-6 py-3"
                  onClick={() => setActiveTab("search")}
                >
                  Tra Cứu
                </Button>
              </div>
              <div className="sec vocabulary">
                <img src="/tuvung.png" />
                <Button
                  className="uppercase text-3xl px-6 py-3"
                  onClick={() => setActiveTab("manage")}
                >
                  Từ Vựng
                </Button>
              </div>
              <div className="sec sentence">
                <img src="/baidoc.png" />
                <Button
                  className="uppercase text-3xl px-6 py-3"
                  onClick={() => setActiveTab("sentences")}
                >
                  Bài Đọc
                </Button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
      {!loading && (
        <motion.div
          id="RibbonBottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 1.2 }}
        >
          <div className="ribbon">
            <div className="sec"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
