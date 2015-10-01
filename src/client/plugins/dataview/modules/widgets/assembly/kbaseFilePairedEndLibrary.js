/**
 * Output widget to vizualize KBaseFile.PairedEndLibrary object.
 * 
 * Pavel Novichkov <psnovichkov@lbl.gov>
 * @public
 */
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb_widget_dataview_assembly_singleObjectBasic'
],
    function ($) {
        'use strict';
        $.KBWidget({
            name: 'kbaseFilePairedEndLibrary',
            parent: 'kbaseSingleObjectBasicWidget',
            version: '1.0.1',
            getDataModel: function (objData) {
                var model = {
                    description: "This data object is a reference to a paired end read library",
                    items: []
                };

                if (objData.strain) {
                    var organism = '';
                    if (objData.strain.genus) {
                        organism = objData.strain.genus;
                    }
                    if (objData.strain.species) {
                        organism += " " + objData.strain.species;
                    }
                    if (objData.strain.strain) {
                        organism += " " + objData.strain.strain;
                    }
                    model.items.push({name: 'Organism', value: organism});
                }

                if (objData.lib1 && objData.lib1.file && objData.lib1.file.file_name) {
                    model.items.push({name: 'Left reads source file name', value: objData.lib1.file.file_name});
                }
                if (objData.lib2 && objData.lib2.file && objData.lib2.file.file_name) {
                    model.items.push({name: 'Right reads source file name', value: objData.lib2.file.file_name});
                }

                if (objData.source) {
                    if (objData.source.source) {
                        model.items.push({name: 'Source', value: objData.source.source});
                    }
                    if (objData.source.project_id) {
                        model.items.push({name: 'Project ID', value: objData.source.project_id});
                    }
                    if (objData.source.source_id) {
                        model.items.push({name: 'Source ID', value: objData.source.source_id});
                    }

                }

                if (objData.read_count) {
                    model.items.push({name: 'Read count', value: objData.read_count});
                }

                if (objData.read_size) {
                    model.items.push({name: 'Read size', value: objData.read_size});
                }

                if (objData.sequencing_tech) {
                    model.items.push({name: 'Sequencing technology', value: objData.sequencing_tech});
                }

                return model;
            }
        });
    });