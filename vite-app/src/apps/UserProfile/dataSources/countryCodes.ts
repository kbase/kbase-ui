import countryCodesData from './data/countryCodesData.json';

const countryCodesRaw = countryCodesData as unknown as Array<[string, string]>;

const countryCodes = countryCodesRaw.map(([label]) => {
    return { label, value: label };
});

export default countryCodes;
