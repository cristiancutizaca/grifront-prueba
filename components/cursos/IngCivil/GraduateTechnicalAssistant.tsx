"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import Image from "next/image";

// Asistente Técnico en Obras - módulos
const modulesTechnicalAssistant = [
  { name: "Planificación y programación de obras", image: "/cursos_gpt/7asistente-obras/1.webp" },
  { name: "Control de obras", image: "/cursos_gpt/7asistente-obras/2.webp" },
  { name: "Metrados en edificaciones", image: "/cursos_gpt/7asistente-obras/3.webp" },
  { name: "Cuaderno de obra físico y digital", image: "/cursos_gpt/7asistente-obras/4.webp" },
  { name: "Valorización de obras", image: "/cursos_gpt/7asistente-obras/6.webp" },
];

const GraduateTechnicalAssistantCarousel = () => {
  // Función para abrir WhatsApp con un mensaje personalizado
  const handleCardClick = (moduleName: string) => {
    const whatsappUrl = `https://wa.me/51984040264?text=${encodeURIComponent(
      `Hola, estoy interesado en el curso "${moduleName}" y me gustaría recibir más información.`
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="bg-white px-6">
      <div className="py-10 relative z-10 max-w-[1400px] mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          loop
          spaceBetween={10}
          slidesPerView={1}
          centeredSlides
          autoplay={{ delay: 3000 }}
          grabCursor
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            940: { slidesPerView: 3, spaceBetween: 30 },
            1200: { slidesPerView: 3, spaceBetween: 10 },
          }}
        >
          {modulesTechnicalAssistant.map((module, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="relative w-full h-[300px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] xl:w-[400px] xl:h-[400px] flex items-center justify-center cursor-pointer rounded-xl overflow-hidden"
                onClick={() => handleCardClick(module.name)}
              >
                <h3 className="sr-only">{module.name}</h3>
                <Image
                  src={module.image}
                  alt={module.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                  priority={true}
                  unoptimized={true}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default GraduateTechnicalAssistantCarousel;
