import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks which of a list of section elements is currently at the top of
 * the app's scroll pane (#app-scroll), for StepNav highlighting.
 * Returns [refs, activeIndex, scrollTo].
 */
export default function useScrollSpy(deps = []) {
    const refs = useRef([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const root = document.getElementById('app-scroll');
        if (!root) return undefined;
        const onScroll = () => {
            const top = root.getBoundingClientRect().top + 120;
            let current = 0;
            refs.current.forEach((el, i) => {
                if (el && el.getBoundingClientRect().top <= top) current = i;
            });
            // Bottom of the page: last section wins even if it's short.
            if (root.scrollTop + root.clientHeight >= root.scrollHeight - 4) current = refs.current.filter(Boolean).length - 1;
            setActive(current);
        };
        onScroll();
        root.addEventListener('scroll', onScroll, { passive: true });
        return () => root.removeEventListener('scroll', onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    const scrollTo = useCallback((index) => {
        refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(index);
    }, []);

    return [refs, active, scrollTo];
}
