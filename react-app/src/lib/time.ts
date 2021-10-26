interface TimeUnitInfo {
    long: string;
    short: string;
    single: string;
    size: number;
    unit: TimeUnit;
}

export enum TimeUnit {
    MILLISECOND,
    SECOND,
    MINUTE,
    HOUR,
    DAY
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const timeUnits: Array<TimeUnitInfo> = [
    {
        unit: TimeUnit.MILLISECOND,
        long: 'millisecond',
        short: 'ms',
        single: 'm',
        size: 1000
    },
    {
        unit: TimeUnit.SECOND,
        long: 'second',
        short: 'sec',
        single: 's',
        size: 60
    },
    {
        unit: TimeUnit.MINUTE,
        long: 'minute',
        short: 'min',
        single: 'm',
        size: 60
    },
    {
        unit: TimeUnit.HOUR,
        long: 'hour',
        short: 'hr',
        single: 'h',
        size: 24
    },
    {
        unit: TimeUnit.DAY,
        long: 'day',
        short: 'day',
        single: 'd',
        size: 30
    }
];

type Format = 'full' | 'short' | 'compact';

/**
 * Options for the nice relative time function
 */
export interface NiceRelativeTimeOptions {
    /** The number of days after which the format will simply be the
     *  timestamp. (Honors compact setting.)
     *  Defaults to 90 days.
     */
    absoluteAfter?: number;
    /**
     * Flag to produce a more compact representation. E.g. second becomes s.
     */
    format?: Format;
    /**
     * The anchor time relative to which the given date is compared.
     * Defaults to Date.now()
     */
    now?: Date;
    /**
     * The number of places of precision for the time format. E.g. a value of 1
     * means to show just the left most time part, undefined means to show all.
     * Defaults to undefined
     */
    precision?: number;
}

/**
 * Given some date, returns a string representation of the amount of time between
 * a current time (defaults to now) and that given time.
 *
 * @param someDate - the date to which we want a relative time measure to
 * @param options - optional set of options as defined above.
 *
 * @example
 * ```
 *
 * const d = new Date(Date.now() + 1000);
 * niceRelativeTime(d);
 *
 * "in 1 second"
 * ```
 */
export function niceRelativeTime(someDate: Date, options: NiceRelativeTimeOptions = {}) {
    const nowDate = options.now || new Date();

    const elapsedRaw = nowDate.getTime() - someDate.getTime();
    const elapsed = Math.round(elapsedRaw / SECOND_MS);
    const elapsedAbs = Math.abs(elapsed);
    const format = options.format || 'compact';

    let measure, measureAbs, unit;
    const maxDays = options.absoluteAfter || 90;
    const maxMS = maxDays * DAY_MS;

    if (Math.abs(elapsedRaw) <= maxMS) {
        if (elapsedAbs === 0) {
            return 'now';
        } else if (elapsedAbs < 60) {
            measure = elapsed;
            measureAbs = elapsedAbs;
            unit = makeUnit(timeUnits[1], format, measureAbs);
        } else if (elapsedAbs < 60 * 60) {
            measure = Math.round(elapsed / 60);
            measureAbs = Math.round(elapsedAbs / 60);
            unit = makeUnit(timeUnits[2], format, measureAbs);
        } else if (elapsedAbs < 60 * 60 * 24) {
            measure = Math.round(elapsed / 3600);
            measureAbs = Math.round(elapsedAbs / 3600);
            unit = makeUnit(timeUnits[3], format, measureAbs);
        } else {
            measure = Math.round(elapsed / (3600 * 24));
            measureAbs = Math.round(elapsedAbs / (3600 * 24));
            unit = makeUnit(timeUnits[4], format, measureAbs);
        }

        // Note that we don't need to handle the 0 value because that is
        // filtered out above.
        const [prefix, suffix] = measure < 0 ? ['in', null] : [null, 'ago'];

        return (prefix ? prefix + ' ' : '') + measureAbs + unit + (suffix ? ' ' + suffix : '');
    } else {
        // otherwise show the actual date, with or without the year.
        if (options.format === 'compact' && nowDate.getFullYear() === someDate.getFullYear()) {
            return Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric'
            }).format(someDate);
        } else {
            return Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(someDate);
        }
    }
}

/**
 * Options for the nice duration function
 */

interface NiceDurationOptions {
    /**
     * The number of places of precision for the time format. E.g. a value of 1
     * means to show just the left most time part, undefined means to show all.
     * Defaults to undefined
     */
    precision?: number;
    /**
     * The format, either full, short, compact
     * Defaults to compact
     */
    format?: Format;
}

function makeUnit(unit: TimeUnitInfo, format: Format, value: number) {
    switch (format) {
        case 'full':
            const label = ' ' + unit.long;
            if (value !== 1) {
                return label + 's';
            }
            return label;
        case 'short':
            return ' ' + unit.short;
        case 'compact':
            return unit.single;
    }
}

/**
 * Provide a "nicely" formatted rendering of a time duration in milliseconds
 *
 * @param value - the duration to format, in milliseconds
 * @param options - options to control formatting
 */
export function niceDuration(value: number, options: NiceDurationOptions = {}) {
    const minimized = [];
    const format = options.format || 'compact';
    let temp = Math.abs(value);
    const parts = timeUnits
        .map(function (unit) {
            // Get the remainder of the current value
            // sans unit size of it composing the next
            // measure.
            const unitValue = temp % unit.size;
            // Recompute the measure in terms of the next unit size.
            temp = (temp - unitValue) / unit.size;

            const unitLabel = makeUnit(unit, format, unitValue);

            return {
                label: unitLabel,
                value: unitValue
            };
        })
        .reverse();

    parts.pop();

    // We skip over large units which have no value until we
    // hit the first unit with value. This effectively trims off
    // zeros from the beginning.
    // We also can limit the resolution with options.resolution, which
    // limits the number of time units to display.
    let keep = false;
    for (let i = 0; i < parts.length; i += 1) {
        if (!keep) {
            if (parts[i].value > 0) {
                keep = true;
            } else {
                continue;
            }
        }
        if (options.precision && options.precision === minimized.length) {
            break;
        }
        minimized.push(parts[i]);
    }

    if (minimized.length === 0) {
        // This means that there is are no time measurements > 1 second.
        return '<' + (format !== 'compact' ? ' ' : '') + '1' + makeUnit(timeUnits[1], format, 1);
    } else {
        // Skip seconds if we are into the hours...
        // if (minimized.length > 2) {
        //     minimized.pop();
        // }
        return minimized
            .map(function (item) {
                return String(item.value) + item.label;
            })
            .join(' ');
    }
}

export interface NiceElapsedResult {
    label: string,
    value: Array<{
        label: string,
        value: number;
    }>;
}

export function niceElapsed(elapsedTime: number, options: NiceDurationOptions = {}): NiceElapsedResult {
    const minimized: Array<{ value: number, label: string; }> = [];
    const format = options.format || 'compact';
    let timeLeftInUnits = Math.abs(elapsedTime);
    const parts = timeUnits
        .map(function (unit, index) {
            if (index === timeUnits.length - 1) {
                // In the case of the last unit, we just let it accumulate the 
                // rest of the time.
                return {
                    label: makeUnit(unit, format, timeLeftInUnits),
                    value: timeLeftInUnits
                };
            } else {
                // Get the remainder of the current time left
                // in terms of the unit size for the _next_ measure.
                const unitValue = timeLeftInUnits % unit.size;

                // Recompute the time left in terms of the next unit size.
                timeLeftInUnits = (timeLeftInUnits - unitValue) / unit.size;

                const unitLabel = makeUnit(unit, format, unitValue);

                return {
                    label: unitLabel,
                    value: unitValue
                };
            }
        })
        .reverse();

    parts.pop();

    // We skip over large units which have no value until we
    // hit the first unit with value. This effectively trims off
    // zeros from the beginning.
    // We also can limit the resolution with options.resolution, which
    // limits the number of time units to display.
    let keep = false;
    for (let i = 0; i < parts.length; i += 1) {
        if (!keep) {
            if (parts[i].value > 0) {
                keep = true;
            } else {
                continue;
            }
        }
        if (options.precision && options.precision === minimized.length) {
            break;
        }
        minimized.push(parts[i]);
    }

    if (minimized.length === 0) {
        // This means that there is are no time measurements > 1 second.
        return {
            label: '<' + (format !== 'compact' ? ' ' : '') + '1' + makeUnit(timeUnits[1], format, 1),
            value: minimized
        };
    } else {
        // Skip seconds if we are into the hours...
        // if (minimized.length > 2) {
        //     minimized.pop();
        // }
        return {
            label: minimized
                .map(function (item) {
                    return String(item.value) + item.label;
                })
                .join(' '),
            value: minimized
        };
    }
}