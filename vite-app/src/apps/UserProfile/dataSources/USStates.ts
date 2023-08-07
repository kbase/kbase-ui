import statesData from './data/USStatesData.json';

const states = statesData as unknown as Array<string>;

const options = states.map((value) => {
    return { value, label: value }
})

export { options, states };
