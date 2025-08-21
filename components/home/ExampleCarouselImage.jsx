import Image from 'next/image';
import React from 'react';

const ExampleCarouselImage = ({ text }) => {
  return (
    <div>
      <Image
        src="/" // Cambia a la ruta correcta de la imagen
        alt={text}
        width={800}
        height={400}
      />
    </div>
  );
};

export default ExampleCarouselImage;
