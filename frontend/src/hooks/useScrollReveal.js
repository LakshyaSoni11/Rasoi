import { useEffect, useRef } from 'react';

const useScrollReveal = () => {
    const revealRefs = useRef([]);
    revealRefs.current = [];

    const addToRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-up');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        revealRefs.current.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return { addToRefs };
};

export default useScrollReveal;
