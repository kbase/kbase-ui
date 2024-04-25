define(() => {
    'use strict';

    const ENTITY_ICONS = {
        'user': 'fa fa-user',
        'narrative': 'fa fa-file-o',
        'workspace': 'fa fa-file-o',
        'job': 'fa fa-suitcase',
        'group': 'fa fa-users'
    };
    const DEFAULT_ICON = 'fa fa-cog';

    /**
     * Returns an i element for an entity icon. Generally something like "fa fa-foobar"
     * @param {string} type - an entity type
     */
    function entityIcon(type) {
        let icon = DEFAULT_ICON;
        if (ENTITY_ICONS[type]) {
            icon = ENTITY_ICONS[type];
        }
        return `<i class="${icon}"></i>`;
    }

    return {
        entity: entityIcon
    };
});
