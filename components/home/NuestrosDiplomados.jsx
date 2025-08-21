"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";

// Lista de cursos con datos de ejemplo
const cursos = [
  { imageUrl: "/image/8.webp", title: "Ingeniería Civil", link: "/diplomados" },
  {
    imageUrl: "/image/diplomados/ing_ambiental.webp",
    title: "Ingeniería Ambiental",
    link: "/diplomados",
  },
  {
    imageUrl: "/image/diplomados/ing_agronoma.webp",
    title: "Ingeniería Agronómica",
    link: "/diplomados",
  },
  { imageUrl: "/image/diplomados/SSOMA.webp", title: "SSOMA", link: "/diplomados" },
  {
    imageUrl: "/image/diplomados/ing_vial.webp",
    title: "Ingeniería Vial",
    link: "/diplomados",
  },
  {
    imageUrl: "/image/diplomados/inocuidad.webp",
    title: "Gestión de la calidad e inocuidad alimentaria",
    link: "/diplomados",
  },
];

// Componente de tarjeta para cada curso
const CourseCard = ({ imageUrl, title, link }) => (
  <Link href={link} passHref>
    <div className="relative group cursor-pointer rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 bg-white h-[450px] w-[450px] mx-auto mt-5 mb-5">
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={`Curso de ${title}`}
          fill
          style={{ objectFit: "cover" }}
          placeholder="blur"
          blurDataURL={imageUrl}
          className="rounded-t-lg"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-70 text-white text-center py-2 md:opacity-0 md:group-hover:bg-opacity-80 md:group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
      </div>
    </div>
  </Link>
);

const CombinedDiplomados = () => (
  <div className="bg-white mx-auto py-16 px-4 lg:px-8 relative">
    <h2 className="text-center text-3xl font-bold uppercase mb-10">Nuestros Diplomados</h2>

    {/* Carrusel para todos los tamaños de pantalla */}
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      loop
      spaceBetween={20}
      slidesPerView={1}
      autoplay={{ delay: 3000 }}
      pagination={{ clickable: true }}
      navigation
      breakpoints={{
        640: { slidesPerView: 1, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      }}
      className="w-full mx-auto max-w-[1500px]"
    >
      {cursos.map((curso, index) => (
        <SwiperSlide key={index}>
          <CourseCard imageUrl={curso.imageUrl} title={curso.title} link={curso.link} />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default memo(CombinedDiplomados);
