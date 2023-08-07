import jobTitles from './data/jobTitles.json';

const options = jobTitles.map((option) => {
    return {
        value: option,
        label: option
    };
});

export default options;