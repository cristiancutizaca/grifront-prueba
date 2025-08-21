import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface Props {
    children: React.ReactNode;
}

const ScrollAnimation: React.FC<Props> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const controls = useAnimation();

    const variants = {
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9 } }
    };

    const handleScroll = () => {
        if (containerRef.current) {
            const elementPosition = containerRef.current.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.1;
    
            if (elementPosition < screenPosition) {
                setIsVisible(true);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isVisible) {
            controls.start("visible");
        }
    }, [isVisible]);

    return (
        <motion.div
            ref={containerRef}
            initial="hidden"
            animate={controls}
            variants={variants}
        >
            {children}
        </motion.div>
    );
};

export default ScrollAnimation;
