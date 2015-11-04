define(['kb.utils'],
   function (Utils) {
      "use strict";
      return Object.create({}, {
       // KBase Service Utility Methods
         // NB: these should really be contained in the service apis, but those are automatically generated.
         // Maybe a kbase services utility module?
         workspace_metadata_to_object: {
            value: function (wsInfo) {
               return {
                  id: wsInfo[0],
                  name: wsInfo[1],
                  owner: wsInfo[2],
                  moddate: wsInfo[3],
                  object_count: wsInfo[4],
                  user_permission: wsInfo[5],
                  globalread: wsInfo[6],
                  lockstat: wsInfo[7],
                  metadata: wsInfo[8],
                  modDate: Utils.iso8601ToDate(wsInfo[3])
               };
            }
         },
         
         /*UnspecifiedObject data;
		object_info info;
		list<ProvenanceAction> provenance;
		username creator;
		timestamp created;
		list<obj_ref> refs;
		obj_ref copied;
		boolean copy_source_inaccessible;
		mapping<id_type, list<extracted_id>> extracted_ids;
		string handle_error;
		string handle_stacktrace;
        */
         
         workspace_object_to_object: {
            value: function(data) {
               data.info = this.object_info_to_object(data.info);
               return data;
            }
            
         },
         
         

         object_info_to_object: {
            value: function (data) {
               var type = data[2].split(/[-\.]/);

               return {
                  id: data[0],
                  name: data[1],
                  type: data[2],
                  save_date: data[3],
                  version: data[4],
                  saved_by: data[5],
                  wsid: data[6],
                  ws: data[7],
                  checksum: data[8],
                  size: data[9],
                  metadata: data[10],
                  ref: data[7] + '/' + data[1],
                  obj_id: 'ws.' + data[6] + '.obj.' + data[0],
                  typeName: type[1],
                  typeMajorVersion: type[2],
                  typeMinorVersion: type[3],
                  saveDate: Utils.iso8601ToDate(data[3])
               };
            }
         },  

         makeWorkspaceObjectId: {
            value: function (workspaceId, objectId) {
               return 'ws.' + workspaceId + '.obj.' + objectId;
            }
         },
         
         makeWorkspaceObjectRef: {
            value: function (workspaceId, objectId, objectVersion) {
               return workspaceId + '/' + objectId + (objectVersion ? ('/' + objectVersion) : "");
            }
         }
      });
   });