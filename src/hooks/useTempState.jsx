import { useCallback, useEffect, useRef, useState } from "react";
import { seconds } from "../utils/utils";

export function useTempState(defaultValue = false, time = seconds(3)) {
    const [state, setState] = useState(defaultValue);
    const timer = useRef(null);
    const defaultRef = useRef(defaultValue);
    const timeRef = useRef(time);

    useEffect(() => { defaultRef.current = defaultValue; }, [defaultValue]);
    useEffect(() => { timeRef.current = time; }, [time]);

    const set = useCallback((value) => {
        setState(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState(defaultRef.current), timeRef.current);
    }, []);

    const reset = useCallback(() => {
        clearTimeout(timer.current);
        setState(defaultRef.current);
    }, []);

    return [state, set, reset];
}