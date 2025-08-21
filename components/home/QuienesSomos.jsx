import React from "react";
import { motion } from "framer-motion";

const QuienesSomos = () => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          x: 0,
          opacity: 1,
          y: 0,
          transition: { duration: 2 },
        },
      }}
      initial="hidden"
      animate="visible"
      transition={{ type: "spring", stiffness: 100, duration: 0.9 }}
      className="fade-in-right mx-auto max-w-screen-xl"
    >
      <div className="p-8  md:px-10 flex flex-col items-center rounded-t-lg">
        <h2 className="text-primaryblue dark:text-blue-50 text-4xl font-extrabold mb-4">
          ¿Quiénes somos?
        </h2>
        <p className="text-lg font-normal text-gray-800 dark:text-white text-center">
          En Ecomás, ofrecemos diplomados, cursos y programas de especialización
          para personas y profesionales que buscan ampliar sus conocimientos y
          habilidades. Combinamos excelencia académica con innovación práctica
          para potenciar tu desarrollo profesional y personal.
        </p>
      </div>
    </motion.div>
  );
};

export default QuienesSomos;
