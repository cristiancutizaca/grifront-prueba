import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

// Datos de testimonios
const testimonios = [
  {
    nombre: "Juan Pérez",
    ocupacion: "Desarrollador Web",
    testimonio:
      "He tenido una experiencia increíble con Inalta. Los cursos son muy completos y los profesores altamente capacitados. Gracias a ellos, he podido avanzar significativamente en mi carrera.",
    foto: "/image/testimonios/juan.jpg",
  },
  {
    nombre: "Carlos López",
    ocupacion: "Diseñadora Gráfica",
    testimonio:
      "Inalta ha sido clave en mi desarrollo profesional. Los cursos son muy prácticos y los materiales están siempre actualizados.",
    foto: "/image/testimonios/carlos.jpg",
  },
  {
    nombre: "Ana García",
    ocupacion: "Ingeniero de Software",
    testimonio:
      "Los conocimientos adquiridos en Inalta me han permitido liderar proyectos importantes. Los instructores son muy profesionales y accesibles.",
    foto: "/image/testimonios/ana.jpg",
  },
  {
    nombre: "Daniela Pérez",
    ocupacion: "Desarrollador Web",
    testimonio:
      "La plataforma de Inalta me ayudó a desarrollar habilidades que no encontraba en otros cursos. Recomiendo a cualquiera que quiera profundizar en el desarrollo web.",
    foto: "/image/testimonios/dani.jpg",
  },
  {
    nombre: "Oscar Gonzalo",
    ocupacion: "Diseñador Gráfico",
    testimonio:
      "La calidad de los cursos y la atención personalizada me permitieron mejorar mi portafolio y encontrar un mejor empleo. Estoy muy agradecido con Inalta.",
    foto: "/image/testimonios/oscar.jpg",
  },
  {
    nombre: "Miriam Alvarado",
    ocupacion: "Ingeniero de Software",
    testimonio:
      "Gracias a Inalta, he mejorado mis habilidades técnicas y aprendido a liderar equipos de desarrollo con éxito. Sus métodos de enseñanza son efectivos y accesibles.",
    foto: "/image/testimonios/miriam.jpg",
  },
];

// Configuración del carrusel
const carouselConfig = {
  spaceBetween: 30,
  pagination: { clickable: true },
  modules: [Pagination],
  breakpoints: {
    640: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  },
};

const TestimoniosCarrusel = () => (
  <div className="bg-gradient-to-b from-white via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
    <h2 className="text-center text-black text-3xl sm:text-4xl font-extrabold uppercase mb-8">
      Testimonios
    </h2>
    <div className="max-w-4xl mx-auto">
      <Swiper {...carouselConfig} className="mySwiper">
        {testimonios.map(({ nombre, ocupacion, testimonio, foto }, index) => (
          <SwiperSlide key={index}>
            <div className="flex h-[500px] justify-center flex-col items-center p-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <img
                src={foto}
                alt={nombre}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mb-6"
              />
              <blockquote className="flex flex-col justify-between flex-grow text-center">
                <p className="text-lg text-gray-900 mb-4">"{testimonio}"</p>
                <footer className="text-gray-600">
                  <cite className="block font-semibold">{nombre}</cite>
                  <p>{ocupacion}</p>
                </footer>
              </blockquote>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
);

export default TestimoniosCarrusel;
