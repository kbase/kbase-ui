/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * Output widget to vizualize KBaseAssembly.AssemblyInput object.
 *
 * Pavel Novichkov <psnovichkov@lbl.gov>
 * @public
 */
define(['jquery', 'kb_widget_dataview_assembly_singleObjectBasic'],
    function ($) {
        'use strict';
        $.KBWidget({
            name: 'kbaseAssemblyInput',
            parent: 'kbaseSingleObjectBasicWidget',
            version: '1.0.1',
            getDataModel: function (objData) {
                var model = {
                    description: objData.dataset_description,
                    items: []
                };

                // Single end read libraries
                if (objData.single_end_libs) {
                    model.items.push({header: "1", name: 'Single end read library'});
                    for (var i = 0; i < objData.single_end_libs.length; i++) {
                        var sel = objData.single_end_libs[i];
                        if (sel.handle && sel.handle.file_name) {
                            model.items.push({
                                name: $("<span />").css("padding-left", "2em").appen('Reads source file name'),
                                value: sel.handle.file_name
                            });
                        }
                    }
                }

                // Paired end read libraries
                if (objData.paired_end_libs) {
                    model.items.push({header: 1, name: 'Paired end read library'});
                    for (var i = 0; i < objData.paired_end_libs.length; i++) {
                        var pel = objData.paired_end_libs[i];
                        if (pel.handle_1 && pel.handle_1.file_name && pel.handle_2 && pel.handle_2.file_name) {
                            model.items.push({
                                name: $("<span />").css("padding-left", "2em").append('Left reads source file name'),
                                value: pel.handle_1.file_name
                            });
                            model.items.push({
                                name: $("<span />").css("padding-left", "2em").append('Right reads source file name'),
                                value: pel.handle_2.file_name
                            });

                        }
                    }
                }

                // References ... what is that?
                if (objData.expected_coverage)
                    model.items.push({name: 'Expected coverage', value: objData.expected_coverage});
                if (objData.estimated_genome_size)
                    model.items.push({name: 'Estimated genome size', value: objData.estimated_genome_size});

                return model;
            }

        });
    });
