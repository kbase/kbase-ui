import higherEdData from './data/higherEdData.json';
import nationalLabsData from './data/nationalLabsData.json';

const nationalLabs = nationalLabsData as unknown as Array<string>;
const higherEd = higherEdData as unknown as Array<string>;

const institutions = nationalLabs.concat(higherEd).sort().map((value) => {
    return { value, label: value }
});

export default institutions;
