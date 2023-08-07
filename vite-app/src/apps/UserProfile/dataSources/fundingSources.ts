import fundingSourcesData from './data/fundingSourcesData.json';

const fundingSources = fundingSourcesData as unknown as Array<string>;

const options = fundingSources.sort().map((value) => {
    return { value, label: value }
})

export { fundingSources, options };
