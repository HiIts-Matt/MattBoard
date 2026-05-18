import { useEffect, useState } from "react";

export function useDelayedUnmount(mounted, duration = 200) {
    const [rendered, setRendered] = useState(mounted);
    const [open, setOpen] = useState(mounted);

    useEffect(() => {
        if (mounted) {
            setRendered(true);
            const id = requestAnimationFrame(() => setOpen(true));
            return () => cancelAnimationFrame(id);
        }
        setOpen(false);
        const id = setTimeout(() => setRendered(false), duration);
        return () => clearTimeout(id);
    }, [mounted, duration]);

    return { rendered, open };
}
