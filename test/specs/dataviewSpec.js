/* global describe, it, expect, browser, beforeAll */
/*
This set of tests does not require authorization...
*/

// TODO: use a clean-up page (an empty page, should put one in the web app), to "clear"
// the browser between tests. Otherwise a slow loading may result in getting value from
// the previous one.

'use strict';
// Note this is in an intermediary development state -- requiring token to be inserted
// below before runnint tests. The token will be moved to a non-checked-in 
// config file later.
var token = process.env.KBASE_SESSION;
// var timeout = process.env.TEST_TIMEOUT || 30000;
var timeout = 30000;

// console.log('Starting with ' + token + ', ' + timeout);

var testingTable = [
    // {
    //     module: 'KBaseGenomes',
    //     type: '	Genome',
    //     version: '8.0',
    //     title: 'Dataview for Sorghum bicolor genome',
    //     comments: 'Eukaryotic genome view',
    //     objectRef: '22676/8/6',
    //     nodes: [
    //         // title
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-widget="dataview-overview"] h3',
    //             text: 'Transcriptome_Sbi_shoots_PEG_upregulated'
    //         },
    //         // Publications subwidget
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="publications"] [data-element="title"]',
    //             text: 'Publications'
    //         },
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="publications"] [name="lit-query-box"]',
    //             value: 'Sorghum bicolor'
    //         },
    //         // Taxonomy subwidget
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="taxonomy"] [data-element="title"]',
    //             text: 'Taxonomy'
    //         },
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="taxonomy"] [data-field="scientific-name"]',
    //             text: 'Sorghum bicolor'
    //         },
    //         // // Assembly and annotation sub widget
    //         // // The title
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="assembly-annotation"] [data-element="title"]',
    //             text: 'Assembly and Annotation'
    //         },
    //         // // The response for euks
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="assembly-annotation"] [data-element="body"]',
    //             text: 'Browsing Eukaryotic Genome Features is not supported at this time.'
    //         }
    //     ]
    // }, {
    //     module: 'KBaseGenomes',
    //     type: '	Genome',
    //     version: '7.0',
    //     title: 'Dataview for Rhodobacter sphaeroides genome',
    //     objectRef: '22676/5/1',
    //     nodes: [
    //         // TItle
    //         {
    //             selector: '[data-widget="dataview-overview"] h3',
    //             text: 'Rhodobacter_sphaeroides_2.4.1_KBase'
    //         },
    //         // Publications subwidget
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="publications"] [data-element="title"]',
    //             text: 'Publications'
    //         },
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="publications"] [name="lit-query-box"]',
    //             value: 'Rhodobacter sphaeroides 2.4.1'
    //         },
    //         // Taxonomy subwidget
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="taxonomy"] [data-element="title"]',
    //             text: 'Taxonomy'
    //         },
    //         {
    //             selector: '[data-kbase-view="dataview"] [data-panel="taxonomy"] [data-field="scientific-name"]',
    //             text: 'Rhodobacter sphaeroides 2.4.1'
    //         },
    //     ]
    // }, {
    //     module: 'KBaseGenomes',
    //     type: '	ContigSet',
    //     version: '3.0',
    //     title: 'Dataview for Pangenome',
    //     objectRef: '8020/70/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: '12319_RefSeq_contigset_legacy'
    //     }]
    // }, {
    //     module: 'KBaseGenomes',
    //     type: '	Pangenome',
    //     version: '4.0',
    //     title: 'Dataview for Panegenome',
    //     objectRef: '22676/17/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'AMC_OrthoMCL'
    //     }]
    // }, {
    //     module: 'KBaseBiochem',
    //     type: '	Media',
    //     version: '1.0',
    //     title: 'Dataview for Media',
    //     objectRef: '22676/6/8',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'Rsp-minimal'
    //     }]
    // }, {
    //     module: 'KBaseFile',
    //     type: 'PairedEndLibrary',
    //     version: '4.0',
    //     title: 'Dataview for Paired End Library',
    //     objectRef: '15/38/4',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'rhodo.art.jgi.reads'
    //     }]
    // }, {
    //     module: 'KBaseFBA',
    //     type: '	FBAModel',
    //     version: '14.0',
    //     title: 'Dataview for FBAModel',
    //     objectRef: '22676/11/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'Caldi_gapfilled_models'
    //     }]
    // }, {
    //     module: 'KBaseFBA',
    //     type: '	FBA',
    //     version: '13.0',
    //     title: 'Dataview for FBA ',
    //     objectRef: '22676/12/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: '211586.9.glucose_fba'
    //     }]
    // }, {
    //     module: 'KBaseGenomeAnnotations',
    //     type: '	Assembly',
    //     version: '6.0',
    //     title: 'Dataview for Assembly',
    //     objectRef: '22676/13/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'GCF_000001735.3_assembly'
    //     }]
    // }, {
    //     module: 'KBaseOntology',
    //     type: 'OntologyDictionary',
    //     version: '4.1',
    //     title: 'Dataview for Ontology Dictionary ',
    //     objectRef: '22676/14/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'environment_ontology'
    //     }]
    // }, {
    //     module: 'KBaseOntology',
    //     type: 'OntologyTranslation',
    //     version: '3.0',
    //     title: 'Dataview for Ontology Translation ',
    //     objectRef: '22676/15/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'sso2go'
    //     }]
    // }, {
    //     module: 'KBasePhenotypes',
    //     type: 'PhenotypeSet',
    //     version: '3.0',
    //     title: 'Dataview for Ontology Translation ',
    //     objectRef: '22676/16/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'SB2B_phenotypes'
    //     }]
    // }, {
    //     module: 'KBaseSets',
    //     type: 'ReadsSet',
    //     version: '1.0',
    //     title: 'Dataview for Reads Set ',
    //     objectRef: '22676/18/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'set_o_reads'
    //     }]
    // }, {
    //     module: 'KBaseSearch',
    //     type: 'GenomeSet',
    //     version: '3.0',
    //     title: 'Dataview for Genome Set ',
    //     objectRef: '22676/19/1',
    //     nodes: [{
    //         selector: '[data-widget="dataview-overview"] h3',
    //         text: 'Carsonella.GS'
    //     }]
    // }, 
    // KBaseTrees.Tree-1.0
    {
        module: 'KBaseTrees',
        type: 'Tree',
        version: '1.0',
        title: 'Dataview for Tree ',
        objectRef: '22676/20/1',
        nodes: [{
            selector: '[data-widget="dataview-overview"] h3',
            text: 'AMC_tree'
        }]
    },
    // Communities.FunctionalMatrix-3.0
    {
        module: 'Communities',
        type: 'FunctionalMatrix',
        version: '3.0',
        title: 'Dataview for Functional Matrix ',
        objectRef: '22676/21/1',
        nodes: [{
            selector: '[data-widget="dataview-overview"] h3',
            text: 'wgs.collection.abundance_profile.norm'
        }]
    },
    // Communities.Metagenome-2.0
    {
        module: 'Communities',
        type: 'Metagenome',
        version: '2.0',
        title: 'Dataview for Functional Matrix ',
        objectRef: '22676/22/1',
        nodes: [{
            selector: '[data-widget="dataview-overview"] h3',
            text: 'mgm4477902.3.wgs.metagenome'
        }]
    },
    // GenomeUtil.BlastOuptut-4.0
    {
        module: 'GenomeUtil',
        type: 'BlastOutput',
        version: '4.0',
        title: 'Dataview for Blast Output ',
        objectRef: '22676/23/1',
        nodes: [{
            selector: '[data-widget="dataview-overview"] h3',
            text: 'balst_output_1'
        }]
    }
];
// module: 'KBaseFeatureValues',
//     type: '	ExpressionMatrix',
//     version: '1.0',
//     title: 'Dataview for Expression Matrix (need better data!)',
//     objectRef: '22676/7/1',
//     nodes: [{
//         selector: '[data-widget="dataview-overview"] h3',
//         text: 'SomeFakeData'
//     }]


describe('Dataview Specs ', function () {
    beforeAll(function () {
        browser.url('/');
        browser.setCookie({
            name: 'kbase_session',
            value: token,
            domain: 'ci.kbase.us'
        });
        browser.waitForExist('[data-element="user-label"]', timeout);
    });
    var lastObjectRef;
    testingTable.forEach(function (test) {
        test.nodes.forEach(function (node) {
            it(test.title, function () {
                if (lastObjectRef !== test.objectRef) {
                    browser.url('/#dataview/' + test.objectRef);
                    lastObjectRef = test.objectRef;
                }
                browser.waitForExist(node.selector, timeout);
                browser.waitUntil(function () {
                    if (node.text) {
                        return browser.getText(node.selector) === node.text;
                    } else if (node.value) {
                        return browser.getValue(node.selector) === node.value;
                    }
                }, timeout, 'Could not find text "' + node.text + '" on selector "' + node.selector + '"');
            });
        });
    });

});


// var unimplementedTypes = [{
//     module: 'Empty',
//     type: 'Atype',
//     version: '1.0',
//     objectRef: '13105/23/1',
//     objectName: 'empty'
// }];
// describe('Types with no viewers ', function () {
//     beforeAll(function () {
//         browser.url('/');
//         browser.setCookie({
//             name: 'kbase_session',
//             value: token,
//             domain: 'ci.kbase.us'
//         });
//         browser.waitForExist('[data-element="user-label"]', 5000);
//     });
//     var objectNameSelector = '[data-widget="dataview-overview"] h3';
//     var dataViewSelector = '[data-element="data-view"]';
//     unimplementedTypes.forEach(function (test) {
//         it(test.title, function () {
//             browser.url('/#dataview/' + test.objectRef);
//             browser.waitForExist(dataViewSelector, 5000);
//             var text = browser.getText(objectNameSelector);
//             expect(text).toEqual(test.objectName);
//             text = browser.getText(dataViewSelector);
//             expect(text).toEqual('This widget does not have a specific visualization');
//         });
//     });
// });
