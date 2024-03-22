import {
    JSONValue
} from '@kbase/ui-lib/lib/json';
import { JSONArrayOf, JSONObject } from 'lib/json';
import { JSONLikeObject, toJSON, toJSONObject } from '../../../jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';

// Get Method Brief Info

export type AppTag = 'dev' | 'beta' | 'release';

export interface GetMethodBriefInfoParams {
    ids: Array<string>;
    tag?: AppTag | null;
}

export interface GetMethodBriefInfoResult extends JSONLikeObject {
    id: string;
    module_name: string;
    git_commit_hash: string;
    name: string;
    ver: string;
    subtitle: string;
    tooltip: string;
    icon: {
        url: string;
    };
    categories: Array<string>;
    authors: Array<string>;
    input_types: Array<string>;
    output_types: Array<string>
    app_type: string;
    namespace: string;
}

export type SDKBoolean = 1 | 0;

export type SDKAppVersionTag = 'dev' | 'beta' | 'release';

export interface ListCategoriesParams extends JSONObject {
    load_methods: SDKBoolean;
    load_apps: SDKBoolean;
    load_types: SDKBoolean;
    tag: SDKAppVersionTag;
}

export interface Category extends JSONObject{
    id: string;
    name: string;
    ver: string;
    tooltip: string;
    description: string;
    parent_ids: Array<string>;
    loading_error: string;
}
export interface Icon extends JSONObject {
    url: string;
}
export interface MethodBriefInfo extends JSONObject {
    id: string;
    module_name: string;
    git_commit_hash: string;
    name: string;
    ver: string;
    subtitle: string;
    tooltip: string;
    icon: Icon;
    categories: Array<string>;
    loading_error: string;
    authors: Array<string>;
    input_types: Array<string>;
    output_types: Array<string>;
    app_type: string;
}

export interface AppBriefInfo extends JSONObject {
    id: string;
    name: string;
    ver: string;
    subtitle: string;
    tooltip: string;
    header: string;
    icon: Icon;
    categories: Array<string>;
    loading_error: string;
}

export interface ScreenShot extends JSONObject {
    url: string;
}

export interface TypeInfo extends JSONObject {
    type_name: string;
    name: string;
    subtitle: string;
    tooltip: string;
    description: string;
    icon: ScreenShot;
    view_method_ids: Array<string>;
    export_functions: Record<string, string>;
    landing_page_url_prefix: string;
    loading_errors: string;
}

export type ListCategoriesResult = [
    Record<string, Category>,         // categories
    Record<string, MethodBriefInfo>,  // methods
    Record<string, AppBriefInfo>,     // apps
    Record<string, TypeInfo>          // types
];


// export interface ListCategoriesResult extends JSONObject {
//     categories: Record<string, Category>;
//     methods: Record<string, MethodBriefInfo>;
//     apps: Record<string, AppBriefInfo>;
//     types: Record<string, TypeInfo>;
// }

export interface GetMethodSpecParams extends JSONLikeObject {
    ids: Array<string>;
    tag?: string;
}

export interface WidgetSpec {
    input: string;
    output: string;
}

export interface RegexMatcher extends JSONObject {
    regex: string;
    error_text: string;
    match: SDKBoolean;
}

export interface TextOptions extends JSONObject{
    valid_ws_types: Array<string>;
    validate_as: string;
    is_output_name: boolean;
    placeholder: string;
    min_int: number;
    max_int: number;
    min_float: number;
    max_float: number;
    regex_constraints: Array<RegexMatcher>
}

export interface DropdownOption extends JSONObject {
    value: string;
    display: string;
}

export interface DropdownOptions extends JSONObject {
    options: Array<DropdownOption>;
    multiselection: SDKBoolean;
}

export interface CheckboxOptions extends JSONObject {
    checked_value: number;
    unchecked_value: number;
}

export interface RadioOptions extends JSONObject {
    id_order: Array<string>;
    ids_to_options: Record<string, string>;
    ids_to_tooltip: Record<string, string>
}

export interface TabOptions extends JSONObject {
    tab_id_order: Array<string>;
    tab_id_to_tab_name: Record<string, string>;
    tab_id_to_param_ids: Record<string, string>;
}

export type UnspecifiedObject = JSONObject;

export interface DynamicDropdownOptions  extends JSONObject {
    data_source: string;
    service_functions: string;
    service_versions: string;
    service_params: UnspecifiedObject;
    selection_id: string;
    exact_match_on: string;
    description_template: string;
    multiselection: SDKBoolean;
    query_on_empty_input: SDKBoolean;
    result_array_index: number;
    path_to_selection_items: Array<string>;
}

export interface SubdataSelection extends JSONLikeObject {
    constant_ref: Array<string>;
    parameter_id: string;
    subdata_included: Array<string>;
    path_to_subdata: Array<string>;
    selection_id: string;
    selection_description: Array<string>;
    description_template: string;
    service_function?: string;
    service_version?: string;
}

export interface  TextSubdataOptions extends JSONLikeObject {
    placeholder: string
    multiselection: SDKBoolean;
    show_src_obj: SDKBoolean;
    allow_custom: SDKBoolean;
    subdata_selection: SubdataSelection;
}


export interface MethodParameter extends JSONLikeObject {
    id: string;
    ui_name: string;
    short_hint: string;
    description: string;
    field_type: string;
    allow_multiple: SDKBoolean;
    optional: SDKBoolean;
    disabled: SDKBoolean;
    ui_class: string;
    default_values: Array<string>;
    valid_file_types: Array<string>;
    text_options?: TextOptions;
    checkbox_options?: CheckboxOptions;
    dropdown_options: DropdownOptions;
    dynamic_dropdown_options: DynamicDropdownOptions;
    radio_options: RadioOptions;
    tab_options: TabOptions;
    textsubdata_options: TextSubdataOptions;
}

export interface FixedMethodParameter extends JSONObject {
    ui_name: string;
    description: string;
}

export interface MethodParameterGroup extends JSONLikeObject {
    id: string;
    parameter_ids: Array<string>
    ui_name: string;
    short_hint: string;
    description: string;
    allow_multiple: SDKBoolean;
    optional: SDKBoolean;
    id_mapping?: Record<string, string>
}

export interface AutoGeneratedValue extends JSONLikeObject {
    prefix?: string;
    symbols?: number;
    suffix?: string;
}

export interface ServiceMethodInputMapping extends JSONLikeObject {
    input_parameter?: string;
    constant_value?: UnspecifiedObject;
    narrative_system_variable?: string;
    generated_value?: AutoGeneratedValue;
    targetArgument_position?: number;
    target_property?: string;
    target_type_transform?: string;
}

export interface ServiceMethodOutputMapping extends JSONLikeObject {
    input_parameter?: string;
    service_method_output_path?: Array<string>;
    constant_value?: UnspecifiedObject;
    narrative_system_variable?: string;
    target_property?: string;
    target_type_transform?: string;
}

export interface OutputMapping extends JSONLikeObject {
    input_parameter?: string;
    constant_value?: UnspecifiedObject;
    narrative_system_variable?: string;
    target_property?: string;
    target_type_transform?: string;
}

export interface MethodBehavior extends JSONLikeObject {
    kb_service_url: string;
    kb_service_version: string;
    kb_service_name?: string;
    kb_service_method?: string;
    resource_estimator_module?: string;
    resource_estimator_method?: string;
    kb_service_input_mapping?: Array<ServiceMethodInputMapping>;
    kb_service_output_mapping?: Array<ServiceMethodOutputMapping>;
    output_mapping: Array<OutputMapping>;
}

export interface MethodSpec {
    info: MethodBriefInfo;
    replacement_text: string;
    widgets: WidgetSpec;
    parameters: Array<MethodParameter>;
    fixed_parameters: Array<FixedMethodParameter>;
    parameter_groups: Array<MethodParameterGroup>;
    behavior: MethodBehavior;
    job_id_output_fields: string;
}

export type GetMethodSpecResult = Array<MethodSpec>

export interface ListMethodsParams extends JSONLikeObject {
    offset?: number;
    limit?: number;
    tag?: string;
}



type ListMethodsResult = Array<MethodBriefInfo>;

export default class NarrativeMethodStoreClient extends ServiceClient {
    module = 'NarrativeMethodStore';

    // TODO: should be void not null
    async ver(): Promise<string> {
        const [result] = await this.callFunc<[null], [string]>('ver', [null]);
        return result;
    }

    async get_method_brief_info(
        params: GetMethodBriefInfoParams
    ) {
        const [object] = await this.callFunc<[JSONValue], [JSONValue]>(
            'get_method_brief_info',
            [toJSON(params)]
        );
        return object as GetMethodBriefInfoResult;
    }

    async list_categories(params: ListCategoriesParams) {
        const object = await this.callFunc<[JSONValue], [JSONValue]>(
            'list_categories',
            [toJSON(params)]
        );
        console.log('list categories', object);
        return object as unknown as ListCategoriesResult;
    }

    async get_method_spec(params: GetMethodSpecParams){
        const [result] = await this.callFunc<[JSONValue], [JSONValue]>(
            'get_method_spec',
            [toJSON(params)]
        );
        return result as unknown as GetMethodSpecResult;
    }

    async list_methods(param: ListMethodsParams): Promise<ListMethodsResult> {
        const [result] = await this.callFunc<Array<JSONObject>, Array<JSONArrayOf<JSONObject>>>('list_methods', [toJSONObject(param)]);
        return result as unknown as ListMethodsResult;
    }
}
