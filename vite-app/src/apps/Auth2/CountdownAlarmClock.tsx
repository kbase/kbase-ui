import { Component } from "react";
import CountdownClock from "./CountdownClock";

export interface CountdownAlarmClockProps {
    expiresIn?: number;
    expiresAt?: number;
    onExpired: () => void;
    render: (remaining: number) => JSX.Element
}

enum CountdownAlarmClockStatus {
    NONE = 'NONE',
    RUNNING = 'RUNNING',
    DONE = 'DONE'
}

interface CountdownAlarmClockState {
    status: CountdownAlarmClockStatus;
    remaining: number
}

export default class CountdownAlarmClock extends Component<CountdownAlarmClockProps, CountdownAlarmClockState>  {
    clock: CountdownClock;
    constructor(props: CountdownAlarmClockProps) {
        super(props);
        this.clock = new CountdownClock({
            // tick: 1000,
            expiresIn: this.props.expiresIn,
            expiresAt: this.props.expiresAt,
            onTick: this.onTick.bind(this),
            onExpired: this.onExpired.bind(this)
        });
        this.state = {
            status: CountdownAlarmClockStatus.NONE,
            remaining: this.clock.remaining()
        };
    }

    componentDidMount() {
        this.clock.start();
    }

    componentWillUnmount() {
        if (this.clock === null) {
            return;
        }
        this.clock.stop();
    }

    onTick(remaining: number) {
        this.setState({
            status: CountdownAlarmClockStatus.RUNNING,
            remaining
        });
    }

    onExpired() {
        this.props.onExpired();
        this.setState({
            status: CountdownAlarmClockStatus.DONE
        });
    }

    render() {
        switch (this.state.status) {
            case 'NONE':
            case 'RUNNING':
                return this.props.render(this.state.remaining);
            case 'DONE':
                return this.props.render(0);
        }
    }
}
