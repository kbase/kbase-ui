/**
 * Output widget to vizualize KBaseAssembly.PairedEndLibrary object.
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
define(['jquery', 'kb_widget_dataview_assembly_singleObjectBasic'],
    function ($) {
        'use strict';
        $.KBWidget({
            name: 'kbasePairedEndLibrary',
            parent: 'kbaseSingleObjectBasicWidget',
            version: '1.0.1',
            getDataModel: function (objData) {
                var model = {
                    description: "This data object is a reference to a paired end read library",
                    items: []
                };

                if (objData.handle_1)
                    model.items.push({name: 'Left reads source file name', value: objData.handle_1.file_name});
                if (objData.handle_2)
                    model.items.push({name: 'Right reads source file name', value: objData.handle_2.file_name});
                if (objData.insert_size_mean)
                    model.items.push({name: 'Insert size (mean)', value: objData.insert_size_mean});
                if (objData.insert_size_std_dev)
                    model.items.push({name: 'Insert size (stdev)', value: objData.insert_size_std_dev});
                return model;
            }
        });
    });


