import { memo, useEffect, useRef, useState } from "react"
import styles from './Clock.module.css'
import Clock from "react-clock"
import "react-clock/dist/Clock.css"
import { classNames } from "../../../utils/utils"
import { useBlurBackground } from "../../../hooks/useBlurBackground"

export function ClockComponent({ module }) {
    const [mountTime] = useState(() => new Date())
    const [time, setTime] = useState(mountTime)

    useEffect(() => {
        let timeoutId

        const tickMinute = () => {
            setTime(new Date())
            const now = new Date()
            const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
            timeoutId = setTimeout(tickMinute, msUntilNextMinute)
        }

        const now = new Date()
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
        timeoutId = setTimeout(tickMinute, msUntilNextMinute)
        return () => clearTimeout(timeoutId)
    }, [])

    // Negative CSS animation-delay so the second hand starts at the current
    // wall-clock second instead of at zero. Captured once at mount so the
    // inline style never changes and the animation never restarts.
    const secondOffset = `-${mountTime.getSeconds() + mountTime.getMilliseconds() / 1000}s`

    const variant = module?.variant || 'digital'
    const bigClock = module?.fullsize

    if (variant === 'digital') return <Digital time={time} />
    if (variant === 'analog') return <Analog time={time} module={module} secondOffset={secondOffset} withBlur />
    if (variant === 'both') return (
        <BothWrapper bigClock={bigClock}>
            <Analog time={time} module={module} secondOffset={secondOffset} />
            <Digital time={time} type='both' />
        </BothWrapper>
    )
}

const BothWrapper = memo(function BothWrapper({ bigClock, children }) {
    const ref = useRef(null)
    const [side, setSide] = useState(0)
    const blurStyle = useBlurBackground(ref)

    useEffect(() => {
        if (!bigClock) return
        const el = ref.current?.parentElement
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            setSide(Math.max(0, Math.floor(Math.min(width, height)) - 20))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [bigClock])

    const style = bigClock && side > 0 ? { width: side, height: side } : undefined

    return (
        <div
            ref={ref}
            className={classNames(
                styles.bothWrapper,
                bigClock ? styles.bothWrapperBig : '',
            )}
            style={{
                ...style,
                ...(blurStyle || {}),
            }}
        >
            {children}
        </div>
    )
});

const Digital = memo(function Digital({ time }) {
    const hours = time.getHours() % 12 || 12
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const ampm = time.getHours() >= 12 ? 'PM' : 'AM'

    return (
        <div className={classNames(
            styles.colorScheme,
            styles.digitalWrapper,
        )}>
            <span className={styles.digitalTime}>
                {hours}:{minutes}
            </span>
            <span className={styles.digitalAmPm}>
                {ampm}
            </span>
        </div>
    )
});

const Analog = memo(function Analog({ time, module, secondOffset, withBlur = false }) {
    const bigClock = module?.size === 'lg'
    const showMarks = module?.showMarks ?? true
    const showBorder = module?.showBorder ?? true;
    const analogRef = useRef(null)
    const blurStyle = useBlurBackground(analogRef, { enabled: withBlur })

    return (
        <div
            ref={analogRef}
            className={classNames(
                styles.colorScheme,
                styles.analogWrapper,
                bigClock ? styles.analogWrapperBig : ''
            )}
            style={{
                '--clock-second-offset': secondOffset,
                ...(blurStyle || {}),
            }}
        >
            <Clock
                value={time}
                size={bigClock ? 'calc(100% - 20px)' : '100%'}
                className={classNames(
                    styles.clock,
                    !showMarks ? styles.noMarks : '',
                    bigClock ? styles.bigClock : '',
                    showBorder ? styles.showBorder : '',
                )}
                renderNumbers={module?.showNumbers}
            />
        </div>
    )
});
