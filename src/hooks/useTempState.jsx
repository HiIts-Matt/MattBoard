import { useRef, useState } from "react";
import { seconds } from "../utils/utils";

export function useTempState(defaultValue = false, time = seconds(3)) {
    const [state, setState] = useState(defaultValue);
    const timer = useRef(null);

    function set(value) {
        setState(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState(defaultValue), time);
    }

    function reset() {
        clearTimeout(timer.current);
        setState(defaultValue);
    }

    return [state, set, reset];
}