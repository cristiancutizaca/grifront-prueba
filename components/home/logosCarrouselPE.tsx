import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const slides = [
  { image: "/svg/12.svg" },
  { image: "/svg/13.svg" },
  { image: "/svg/14.svg" },
  { image: "/svg/15.svg" },
  { image: "/svg/12.svg" },
  { image: "/svg/13.svg" },
  { image: "/svg/14.svg" },
  { image: "/svg/15.svg" },
];

const ImageCarrousel = () => {
  const duplicatedSlides = [...slides, ...slides]; // Duplicar las diapositivas para efecto continuo
  // Define la longitud total en píxeles que los elementos ocuparán.
  const itemWidth = 72; // Ajusta según el ancho real de cada elemento (w-[calc(100vw-5.75rem)])
  const totalWidth = itemWidth * duplicatedSlides.length;

  const containerVariants = {
    animate: {
      x: [0, -totalWidth / 2], // Mueve la mitad de la longitud total para un bucle continuo
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop", 
          duration: 6, // Ajusta la duración según la velocidad que desees
          ease: "linear",
        },
      },
    },
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 2 },
        },
      }}
      initial="hidden"
      animate="visible"
      transition={{ type: "spring", stiffness: 100, duration: 0.9 }}
      className="relative overflow-hidden pb-12 mx-auto w-full sm:w-1/2"
    >
      <div className="absolute inset-0 z-10 before:absolute before:left-0 before:top-0 before:w-1/4 before:h-full before:bg-gradient-to-r before:from-white dark:before:from-blackblue dark:after:from-blackblue before:to-transparent before:filter before:blur-3 after:absolute after:right-0 after:top-0 after:w-1/4 after:h-full after:bg-gradient-to-l after:from-white after:to-transparent after:filter after:blur-3"></div>

      <motion.div
        className="flex"
        variants={containerVariants}
        animate="animate"
      >
        {duplicatedSlides.map((slide, index) => (
          <div key={index} className=" bg-transparent max-h-32">
            <div className="flex items-center justify-center w-20 mr-16">
              <Image alt="logo" src={slide.image} width={100} height={100} />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ImageCarrousel;
