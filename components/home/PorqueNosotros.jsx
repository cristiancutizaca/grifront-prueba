"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Carga dinámica del componente Globe (sin SSR)
const Globe = dynamic(() => import("../globe/Globe"), { ssr: false });

// Custom Hook para la animación de conteo
const useCounter = (endValue, isVisible) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTime = performance.now();

    const animateCount = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.ceil(progress * endValue));
      if (progress < 1) requestAnimationFrame(animateCount);
    };

    requestAnimationFrame(animateCount);
  }, [endValue, isVisible]);

  return count;
};

// Memoized component for each card
const InfoCard = memo(({ img, count, text }) => (
  <div className="relative text-center bg-white p-6 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 w-full max-w-[350px] mx-auto">
    <div className="relative z-10">
      <Image
        src={img}
        alt="Gif Animado"
        unoptimized // Deshabilitar la optimización de imágenes para GIFs animados
        width={50}
        height={50}
        className="mx-auto mb-2 transform hover:scale-110 transition-transform duration-300"
      />
      <h2 className="text-lg md:text-3xl font-bold text-black">+{count}</h2>
      <p className="text-black">{text}</p>
    </div>
  </div>
));

const PrincipalHome = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const studentsCount = useCounter(1500, isVisible);
  const diplomasCount = useCounter(50, isVisible);
  const coursesCount = useCounter(400, isVisible);
  const impartedCoursesCount = useCounter(1000, isVisible);

  const cardData = [
    { count: studentsCount, text: "Alumnos beneficiados", img: "/gif/pers2.gif" },
    { count: diplomasCount, text: "Diplomados Disponibles", img: "/gif/graduate2.gif" },
    { count: coursesCount, text: "Cursos Disponibles", img: "/gif/doc1.gif" },
    { count: impartedCoursesCount, text: "Clases virtuales impartidas", img: "/gif/star3.gif" },
  ];

  return (
    <section
      ref={sectionRef}
      className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 md:px-12 bg-gradient-to-b from-white via-blue-200 to-white overflow-hidden"
    >
      {/* Contenedor del Globo (Izquierda) */}
      <div className="flex items-center justify-center w-full md:max-w-[600px] text-left mt-4 md:mt-0 z-10 overflow-hidden">
        <div className="globe-container">
          <Globe />
        </div>
      </div>

      {/* Contenedor del Texto y Métricas (Derecha) */}
      <div className="w-full md:w-1/2 text-left mt-4 md:mt-0 z-10 max-w-screen-lg mx-auto">
        <div className="mb-4 px-2 md:px-0">
          <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase mb-6 md:mb-8">
            ¿Por qué elegir Inalta?
          </h1>
          <p className="text-black md:text-2xl leading-relaxed md:leading-normal">
            Elige Inalta para impulsar tu futuro. Con nuestros cursos especializados, abrimos las puertas a un mundo de conocimientos que te llevará más allá de tus límites.
          </p>
        </div>

        {/* Tarjetas con información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-2 md:px-0">
          {cardData.map((item, index) => (
            <InfoCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(PrincipalHome);
