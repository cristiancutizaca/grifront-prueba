import React, { useState, useEffect } from 'react';
import { IoIosArrowUp } from 'react-icons/io';

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    const isBrowser = () => typeof window !== 'undefined';

    function scrollToTop() {
        if (!isBrowser()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    useEffect(() => {
        if (!isBrowser()) return;

        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
}

export default ScrollToTopButton;
