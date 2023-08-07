import researchInterests from './data/researchInterests.json';

const options = researchInterests.map((option) => {
    return {
        value: option,
        label: option
    };
});

export default options;