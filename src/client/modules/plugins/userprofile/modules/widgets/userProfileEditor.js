define([
    'nunjucks',
    'jquery',
    'bluebird',
    'kb_common/utils',
    'kb_userProfile_widget_base',
    'kb/service/userProfile'
], function(
    nunjucks,
    $,
    Promise,
    Utils,
    SocialWidget,
    UserProfile
) {
    "use strict";
    var UserProfileWidget = Object.create(SocialWidget, {
        init: {
            value: function(cfg) {
                cfg.name = 'UserProfile';
                cfg.title = 'User Profile';
                this.SocialWidget_init(cfg);

                this._generatedId = 0;

                // setup is called whenever the config or params have changed.
                // this.setup();

                // Set up nunjucks templating.
                /*
                 Note that we do not use autoescaping. This means we need to inspect all places where
                 template variables are inserted, and ensure that any values which are derived from
                 user input and not run through a transformation filter are escaped with | e.
                 We would rather not use auto-escaping due to performance concerns.
                 We cannot use auto-escaping due to the need to filter some fields before output.
                 E.g. to insert line breaks, perform simple markup.
                 */
                this.templates.env.addFilter('roleLabel', function(role) {
                    if (this.listMaps['userRoles'][role]) {
                        return this.listMaps['userRoles'][role].label;
                    }
                    return role;
                }.bind(this));
                this.templates.env.addFilter('userClassLabel', function(userClass) {
                    if (this.listMaps['userClasses'][userClass]) {
                        return this.listMaps['userClasses'][userClass].label;
                    }
                    return userClass;
                }.bind(this));
                this.templates.env.addFilter('titleLabel', function(title) {
                    if (this.listMaps['userTitles'][title]) {
                        return this.listMaps['userTitles'][title].label;
                    }
                    return title;
                }.bind(this));
                return this;
            }
        },
        setup: {
            value: function() {
                return null;
            }
        },
        go: {
            value: function() {
                // Show the user we are doing something, since we are about to launch a 
                // query for profile data.
                var widget = this;
                this.setupUI();
                this.renderWaitingView();
                this.setInitialState()
                    .then(function() {
                        return widget.refresh();
                    })
                    .then(function() {
                        widget.runtime.recv('profile', 'loaded', function(profile) {
                            widget.userProfile = profile;
                            // widget.runtime.send('ui', 'alert', 'Hey, new profile loaded');
                            // alert('hey, new profile loaded');
                            widget.refresh();
                        });
                    })
                    .catch(function(err) {
                        widget.renderErrorView(err);
                    });
                return this;
            }
        },
        resetState: {
            value: function() {
                this.userProfile = null;
            }
        },
        /*
         getCurrentState 
         */
        setInitialState: {
            value: function(options) {
                return new Promise(function(resolve, reject, notify) {
                    if (!this.runtime.service('session').isLoggedIn()) {
                        // We don't even try to get the profile if the user isn't 
                        // logged in.
                        this.userProfile = null;
                        resolve();
                    } else {
                        this.userProfile = Object.create(UserProfile).init({
                            runtime: this.runtime,
                            username: this.params.userId
                        });
                        this.userProfile.loadProfile()
                            .then(function() {
                                resolve();
                            })
                            .catch(function(err) {
                                reject(err);
                            });
                    }
                }.bind(this));
            }
        },
        createTemplateContext: {
            value: function() {
                // NB: the guard for userProfile presence below is only necessary
                // because there is a problem with widget startup -- in which a refresh
                // can be issued by setting a param, config, state, and the profile will
                // not have been populated yet because it is async too, and slower.
                // So we need to have some better control over widget state,
                // e.g. to avoid rendering when in an invalid state.                    
                if (this.runtime.service('session').isLoggedIn() && this.userProfile) {
                    return Utils.merge(Utils.merge({}, this.context), {
                        env: {
                            root: this.getConfig('root'),
                            lists: this.lists,
                            isOwner: this.isOwner(),
                            profileCompletion: this.calcProfileCompletion()
                        },
                        userRecord: this.userProfile.userRecord
                    });
                } else {
                    return Utils.merge(Utils.merge({}, this.context), {
                        env: {
                            profileCompletion: 'notloggedin'
                        }
                    });

                }
            }
        },
        calcProfileCompletion: {
            value: function() {
                if (this.runtime.service('session').isLoggedIn()) {
                    var completion = this.userProfile.calcProfileCompletion();
                    var lastSave = this.userProfile.nthHistory(1);
                    if (completion.status === 'complete' && (!lastSave || (lastSave && lastSave.completionStatus === completion.status))) {
                        return null;
                    } else {
                        return completion;
                    }
                } else {
                    return 'notloggedin';
                }
            }
        },
        formToObject: {
            value: function(schema) {
                // walk the schema, building an object out of any form values 
                // that we find.
                var that = this;
                var form = this.places.content.find['form'];
                var fieldValidationErrors = [];
                var objectValidationErrors = [];
                var parser = Object.create({}, {
                    init: {
                        value: function(cfg) {
                            if (typeof cfg.container === 'string') {
                                this.container = $(cfg.container);
                            } else {
                                this.container = cfg.container;
                            }
                            this.currentPath = [];
                            this.jsonRoot = Object.create(null);
                            this.currentJsonNode = this.jsonRoot;
                            this.fieldValidationErrors = cfg.fieldValidationErrors;
                            this.objectValidationErrors = cfg.objectValidationErrors;
                            return this;
                        }
                    },
                    getFieldValue: {
                        value: function(name) {
                            // Each form control is marked with a data-field attribute on a container element, with the name set to the 
                            // property path on the data object. The actual form control is found inisde the container.
                            var field = this.container.find('[data-field="' + name + '"]');
                            if (!field || field.length === 0) {
                                // NB: this is not null, which is reserved for a field with empty data.
                                return undefined;
                            }
                            var control = field.find('input, textarea, select');
                            if (!control || control.length === 0) {
                                // NB: this is not null, which is reserved for a field with empty data.
                                return undefined;
                            }
                            switch (control.prop('tagName').toLowerCase()) {
                                case 'input':
                                    switch (control.attr('type')) {
                                        case 'checkbox':
                                            return control.map(function() {
                                                var $el = $(this);
                                                if ($el.prop('checked')) {
                                                    return $el.val();
                                                } else {
                                                    return null;
                                                }
                                            }).get();
                                        case 'radio':
                                            var value = control.map(function() {
                                                var $el = $(this);
                                                if ($el.prop('checked')) {
                                                    return $el.val();
                                                } else {
                                                    return null;
                                                }
                                            }).get();
                                            if (value.length === 1) {
                                                return value[0];
                                            } else {
                                                return null;
                                            }
                                        default:
                                            var value = control.val();
                                            if (value && value.length > 0) {
                                                return value;
                                            } else {
                                                return null;
                                            }
                                    }
                                case 'textarea':
                                    var value = control.val();
                                    if (value) {
                                        if (value.length === 0) {
                                            value = null;
                                        }
                                    }
                                    return value;
                                case 'select':
                                    var value = control.val();
                                    if (value) {
                                        if (value.length === 0) {
                                            value = null;
                                        }
                                    }
                                    return value;
                            }
                        }
                    },
                    parseObject: {
                        value: function(schema) {
                            var newObject = {};
                            var propNames = Object.getOwnPropertyNames(schema.properties);
                            for (var i = 0; i < propNames.length; i++) {
                                var propName = propNames[i];
                                var propSchema = schema.properties[propName];

                                switch (propSchema.type) {
                                    case 'object':
                                        var json = {};
                                        // var node = parentNode.find('[data-field-group="'+propName+'"]');
                                        this.currentPath.push(propName);

                                        var value = this.parseObject(propSchema);
                                        if (value) {
                                            newObject[propName] = value;
                                        }


                                        this.currentPath.pop();
                                        break;
                                    case 'array':
                                        this.currentPath.push(propName);
                                        var value = this.parseArray(propSchema);
                                        if (value) {
                                            newObject[propName] = value;
                                        }
                                        this.currentPath.pop();
                                        break;
                                    case 'string':
                                        this.currentPath.push(propName);
                                        var value = this.parseString(propSchema);
                                        var error = this.validateString(value, propSchema);
                                        if (error) {
                                            this.addFieldError({
                                                propPath: this.currentPath.join('.'),
                                                message: error

                                            })
                                        }
                                        if (value !== undefined) {
                                            newObject[propName] = value;
                                        }
                                        this.currentPath.pop();
                                        break;
                                    case 'integer':
                                        this.currentPath.push(propName);
                                        var value = this.parseInteger(propSchema);
                                        if (value !== undefined) {
                                            newObject[propName] = value;
                                        }
                                        this.currentPath.pop();
                                        break;
                                    case 'boolean':
                                        // noop
                                        break;
                                    case 'null':
                                        // noop
                                        break;
                                }

                            }

                            if (schema.required) {
                                for (var i = 0; i < schema.required.length; i++) {
                                    var requiredProp = schema.required[i];
                                    if (newObject[requiredProp] === undefined || newObject[requiredProp] === null) {
                                        this.currentPath.push(requiredProp);
                                        var propPath = this.currentPath.join('.');
                                        this.addFieldError({
                                            propPath: propPath,
                                            message: 'This field is required'
                                        });
                                        this.currentPath.pop();
                                    }
                                }
                            }

                            return newObject;
                        }

                    },
                    parseArray: {
                        value: function(schema) {
                            // for now just handle a non-nested array ... i.e. an array of objects or values
                            var itemSchema = schema.items;
                            // The array items are driven by the DOM in this case. We need to loop through the
                            // nodes returned by the selector for this array.
                            //this.currentPath.push(propName);
                            var path = this.currentPath.join('.');
                            // We select the field by the usual method, data-field. On in this case, it will contain
                            // a form control which can provide multiple selections, either a checkbox, a select, or
                            // multiple inputs with the same name (?).
                            // We have to handle the case of multi-valued fields (checkbox)
                            switch (itemSchema.type) {
                                case 'string':
                                    // map to controls here. If the controls are implemented right, as checkboxes or
                                    // a select with multiple-values, we get back an array of values.
                                    return this.getFieldValue(path);
                                case 'object':
                                    // we don't have a canned way to get a set of fields ... yet.
                                    var value = this.container.find('[data-field="' + path + '"] fieldset').map(function(i) {
                                        // do array objects in a separate parser because we need to establish a new
                                        // container (one for each array element) and path (a fresh path for each array element and container)
                                        var newObj = Object.create(parser).init({
                                            container: $(this),
                                            fieldValidationErrors: fieldValidationErrors,
                                            objectValidationErrors: objectValidationErrors
                                        }).parseObject(itemSchema);
                                        return newObj;
                                    }).get();
                                    return value;
                                default:
                                    throw "Can't make array out of " + itemSchema.type + " yet.";
                            }
                        }

                    },
                    validateString: {
                        value: function(value, schema) {
                            // handle formats:
                            if (value) {
                                switch (schema.format) {
                                    case 'email':
                                        var emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                        if (!emailRe.test(value)) {
                                            return 'Invalid email format';
                                        }
                                        break;
                                }
                            }
                            return false;
                        }
                    },
                    parseString: {
                        value: function(schema) {
                            var fieldName = this.currentPath.join('.');
                            return this.getFieldValue(fieldName);
                        }
                    },
                    addFieldError: {
                        value: function(err) {
                            err.container = this.container;
                            this.fieldValidationErrors.push(err);
                        }
                    },
                    parseInteger: {
                        value: function(schema) {
                            var fieldName = this.currentPath.join('.');
                            var strVal = this.getFieldValue(fieldName);
                            if (strVal) {
                                if (strVal.length > 0) {
                                    var intVal = parseInt(strVal);
                                    if (isNaN(intVal)) {
                                        this.addFieldError({
                                            propPath: fieldName,
                                            message: 'Not a valid integer'
                                        });
                                        return undefined;
                                    } else {
                                        var invalid = false;
                                        if (schema.minimum) {
                                            if (schema.minimumExclusive) {
                                                if (intVal <= schema.minimum) {
                                                    invalid = true;
                                                    this.addFieldError({
                                                        propPath: fieldName,
                                                        message: 'The integer value is below or at the minimum of ' + schema.minimum
                                                    });
                                                }
                                            } else {
                                                if (intVal < schema.minimum) {
                                                    invalid = true;
                                                    this.addFieldError({
                                                        propPath: fieldName,
                                                        message: 'The integer value is below the minimum of ' + schema.minimum
                                                    });
                                                }
                                            }
                                        }
                                        if (schema.maximum) {
                                            if (schema.maximumExclusive) {
                                                if (intVal >= schema.maximum) {
                                                    invalid = true;
                                                    this.addFieldError({
                                                        propPath: fieldName,
                                                        message: 'The integer value is above or at the maximum of ' + schema.maximum
                                                    });
                                                }
                                            } else {
                                                if (intVal > schema.maximum) {
                                                    invalid = true;
                                                    this.addFieldError({
                                                        propPath: fieldName,
                                                        message: 'The integer value is above the maximum of ' + schema.maximum
                                                    });
                                                }
                                            }
                                        }
                                        if (invalid) {
                                            return undefined;
                                        } else {
                                            return intVal;
                                        }
                                    }
                                } else {
                                    return undefined;
                                }
                            } else {
                                return undefined;
                            }
                        }
                    }
                });
                var result = parser.init({
                    container: this.places.content,
                    fieldValidationErrors: fieldValidationErrors,
                    objectValidationErrors: objectValidationErrors
                }).parseObject(schema);

                var errors = false;
                if (fieldValidationErrors.length > 0) {
                    errors = true;
                    this.showFieldValidationErrors(fieldValidationErrors);
                }
                if (objectValidationErrors.length > 0) {
                    errors = true;
                    // this.showObjectValidationErrors(objectValidationErrors);
                }

                if (errors) {
                    throw 'Validation errors processing the form';
                } else {
                    return result;
                }
            }
        },
        showFieldValidationErrors: {
            value: function(errors) {
                for (var i = 0; i < errors.length; i++) {
                    var error = errors[i];
                    this.showFieldError(error.container, error.propPath, error.message);
                }
            }
        },
        getUserProfileFormSchema: {
            value: function() {
                // For building and validating user form input for a user profile.
                // This is a subset of the user profile schema.
                // FORNOW: fairly loose, other than sensible limits and formatting checks.
                // NB: 
                return {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            title: 'User',
                            properties: {
                                realname: {
                                    type: 'string',
                                    title: 'Real Name',
                                    maxLength: 100
                                },
                                thumbnail: {
                                    type: 'string',
                                }
                                /*avatar: {
                                 type: 'object',
                                 properties: {
                                 gravatar_defaults: {
                                 type: 'string',
                                 title: 'Gravatar Default Setting'
                                 }
                                 }
                                 }
                                 */
                            },
                            required: ['realname']
                        },
                        profile: {
                            type: 'object',
                            properties: {
                                userdata: {
                                    type: 'object',
                                    properties: {
                                        title: {
                                            type: 'string',
                                            title: 'Title'
                                        },
                                        suffix: {
                                            type: 'string',
                                            title: 'Suffix'
                                        },
                                        location: {
                                            type: 'string',
                                            title: 'Geographic Location',
                                            maxLength: 25
                                        },
                                        email: {
                                            type: 'string',
                                            title: 'E-Mail Address',
                                            format: 'email'
                                        },
                                        personal_statement: {
                                            type: 'string',
                                            title: 'Personal Statement',
                                        },
                                        user_class: {
                                            type: 'string',
                                            title: 'User Type'
                                        },
                                        roles: {
                                            type: 'array',
                                            title: 'Roles',
                                            items: {
                                                type: 'string'
                                            }
                                        },
                                        avatar: {
                                            type: 'object',
                                            properties: {
                                                gravatar_default: {
                                                    type: 'string',
                                                    title: 'Gravatar Default Setting'
                                                }
                                            }
                                        },
                                        affiliations: {
                                            type: 'array',
                                            title: 'Affiliation',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    title: {
                                                        type: 'string',
                                                        title: 'Title'
                                                    },
                                                    institution: {
                                                        type: 'string',
                                                        title: 'Institution'
                                                    },
                                                    start_year: {
                                                        type: 'integer',
                                                        title: 'Start Year',
                                                        minimum: 1900,
                                                        maximum: 2100
                                                    },
                                                    end_year: {
                                                        type: 'integer',
                                                        title: 'End Year',
                                                        minimum: 1900,
                                                        maximum: 2100
                                                    }
                                                },
                                                required: ['title', 'institution', 'start_year']
                                            }
                                        }
                                    },
                                    required: ['email', 'user_class', 'roles', 'location']
                                }
                            }
                        }
                    }
                };
            }
        },
        updateUserProfileFromForm: {
            value: function() {
                this.clearErrors();
                var schema = this.getUserProfileFormSchema();
                try {
                    var profileFromForm = this.formToObject(schema);
                } catch (e) {
                    this.addErrorMessage('There was an error processing the form: ' + e + '. Please check the form for errors, correct them, and try saving again.');
                    return false;
                }

                // SAVING
                if (this.formHasError) {
                    this.addErrorMessage('Your changes cannot be saved due to one or more errors. Please review the form, make the required corrections, and try again.');
                    return false;
                } else {
                    this.userProfile.updateProfile(profileFromForm);
                }

                // Clean up the user info data object.
                return true;
            }
        },

        renderErrorView: {
            value: function(data) {
                // Make sure we have the standard panel layout.
                console.error(data);

                var title;
                if (typeof data === 'string') {
                    data = {
                        title: 'Error',
                        message: data
                    }
                } else if (typeof data === 'object' && data.status && data.error) {
                    // assume a kbase api error.
                    data.title = 'KBase API Error';
                    data.message = data.error.message;
                } else {
                    if (!data.title) {
                        data.title = 'Error';
                    }
                    if (!data.message) {
                        data.message = "unknown error";
                    }
                }

                this.renderLayout();

                this.places.title.html(data.title);
                // this.renderPicture();
                this.places.content.html(this.renderTemplate('error', data));
            }
        },

        // DOM QUERY
        getFieldValue: {
            value: function(name) {
                var field = this.places.content.find('[data-field="' + name + '"]');
                if (!field || field.length === 0) {
                    return undefined;
                } else {
                    var control = field.find('input, textarea, select');
                    var tag = control.prop('tagName').toLowerCase();
                    switch (tag) {
                        case 'input':
                            var inputType = control.attr('type');
                            switch (inputType) {
                                case 'checkbox':
                                    return control.map(function() {
                                        var $el = $(this);
                                        if ($el.prop('checked')) {
                                            return $el.val();
                                        } else {
                                            return null;
                                        }
                                    }).get();
                                case 'radio':
                                    var value = control.map(function() {
                                        var $el = $(this);
                                        if ($el.prop('checked')) {
                                            return $el.val();
                                        } else {
                                            return null;
                                        }
                                    }).get();
                                    if (value.length === 1) {
                                        return value[0];
                                    } else {
                                        return null;
                                    }
                                default:
                                    var value = control.val();
                                    if (value && value.length > 0) {
                                        return value;
                                    } else {
                                        return null;
                                    }
                            }
                        case 'textarea':
                            var value = control.val();
                            if (value) {
                                if (value.length === 0) {
                                    value = null;
                                }
                            }
                            return value;
                            break;
                        case 'select':
                            var value = control.val();
                            if (value) {
                                if (value.length === 0) {
                                    value = null;
                                }
                            }
                            return value;
                            break;
                    }
                }

            }
        },
        getProfileStatus: {
            value: function() {
                if (this.runtime.service('session').isLoggedIn()) {
                    return this.userProfile.getProfileStatus();
                } else {
                    return 'notloggedin';
                }
            }
        },
        // DOM UPDATE

        // main views

        render: {
            value: function() {
                // Generate initial view based on the current state of this widget.
                // Head off at the pass -- if not logged in, can't show profile.
                var state = this.getProfileStatus();
                this.runtime.send('ui', 'clearButtons');
                switch (state) {
                    case 'notloggedin':
                        // NOT LOGGED IN
                        this.renderLayout();
                        this.places.title.html('Unauthorized');
                        this.places.content.html(this.renderTemplate('unauthorized'));
                        break;
                    case 'profile':
                        // NORMAL PROFILE 
                        // Title can be be based on logged in user infor or the profile.
                        // set window title.
                        var realname = this.userProfile.getProp('user.realname');
                        $(document).find('head title').text('User Profile for ' + realname + ' | KBase');

                        this.renderViewEditLayout();
                        this.renderInfoView();
                        break;
                    case 'stub':
                        // STUB PROFILE
                        // Title can be be based on logged in user infor or the profile.
                        var realname = this.userProfile.getProp('user.realname');
                        $(document).find('head title').text('User Profile for ' + realname + ' | KBase');
                        this.renderViewEditLayout();
                        this.renderMessages();
                        this.renderStubProfileView();
                        break;
                        /*
                         case 'accountonly':
                         // NO PROFILE
                         // NB: should not be here!!
                         // no profile, but have basic account info.
                         this.renderLayout();
                         this.places.title.html(this.accountRecord.fullName + ' (' + this.accountRecord.userName + ')');
                         // this.renderPicture();
                         this.renderNoProfileView();
                         break;
                         */
                    case 'error':
                        this.renderLayout();
                        this.renderErrorView('Profile is in error state');
                        break;
                    case 'none':
                        // NOT FOUND
                        // no profile, no basic aaccount info
                        this.renderLayout();
                        this.places.title.html('User Not Found');
                        this.renderPicture();
                        this.places.content.html(this.renderTemplate('no_user'));
                        break;
                    default:
                        this.renderLayout();
                        this.renderErrorView('Invalid profile state "' + state + '"')
                }
                this.renderMessages();
                return this;
            }
        },
        renderInfoView: {
            value: function() {
                var widget = this;
                if (this.isOwner()) {
                    // For now the user profile is available through the login widget, not the session.
                    this.places.title.html('You - ' + this.userProfile.getProp('user.realname') + ' (' + this.userProfile.getProp('user.username') + ')');

                    this.runtime.send('ui', 'clearButtons');
                    this.runtime.send('ui', 'setTitle', 'Your Profile');

                    this.runtime.send('ui', 'addButton', {
                        name: 'account',
                        label: 'Account',
                        style: 'default',
                        icon: 'wrench',
                        callback: function() {
                            this.runtime.send('app', 'redirect', {
                                url: this.runtime.config('resources.userAccount.access.url'),
                                new_window: true
                            })
                        }.bind(this)
                    });

                    this.runtime.send('ui', 'addButton', {
                        name: 'delete',
                        label: 'Delete Profile',
                        style: 'default',
                        icon: 'trash-o',
                        callback: function() {
                            widget.clearMessages();
                            var modal = $('.UserProfileWidget [data-widget-modal="confirm-optout"]').modal('show');
                            // NB the deny button is already wired as [data-dismiss="modal"] which will 
                            // close the modal, and without further intervention, do nothing.
                            modal.find('[data-widget-modal-control="confirm"]').on('click', function(e) {
                                modal.modal('hide').on('hidden.bs.modal', function(e) {
                                    widget.deleteProfile();
                                });
                            });
                        }.bind(this)
                    });
                    this.runtime.send('ui', 'addButton', {
                        name: 'edit',
                        label: 'Edit Profile',
                        style: 'primary',
                        icon: 'edit',
                        callback: function() {
                            widget.clearMessages();
                            widget.renderEditView();
                        }.bind(this)
                    });

                } else {
                    var title = this.userProfile.getProp('user.realname') + ' (' + this.userProfile.getProp('user.username') + ')';
                    this.places.title.html(title);
                    this.runtime.send('ui', 'setTitle', 'Viewing Profile for ' + title);
                }
                this.renderPicture();
                this.places.content.html(this.renderTemplate('view'));


            }
        },
        /* Does not actually delete the profile "userRecord", rather just the user-defined part of the profile
         and the (TODO:) state setting that allows the profile to be viewed */
        deleteProfile: {
            value: function() {
                this.userProfile.deleteUserdata()
                    .then(function() {
                        this.runtime.send('session', 'profile.saved');
                        this.runtime.send('profile', 'check');
                        this.addSuccessMessage('Your profile has been successfully removed.');
                        this.render();
                    }.bind(this))
                    .catch(function(err) {
                        this.renderErrorView(err);
                    }.bind(this));
            }
        },
        showFieldError: {
            value: function(container, field, message) {
                if (typeof field === 'string') {
                    field = container.find('[data-field="' + field + '"]');
                }
                field.addClass('has-error');
                var messageNode = field.find('[data-element="message"]');
                if (message) {
                    messageNode.html(message);
                }
                this.formHasError = true;
            }
        },
        renderEditView: {
            value: function() {
                var W = this;
                this.runtime.send('ui', 'setTitle', { title: 'Editing your profile' });
                this.runtime.send('ui', 'clearButtons');
                this.runtime.send('ui', 'addButton', {
                    name: 'save',
                    label: 'Save',
                    style: 'primary',
                    icon: 'save',
                    disabled: true,
                    callback: function() {
                        if (W.updateUserProfileFromForm()) {
                            W.userProfile.saveProfile()
                                .then(function() {
                                    W.changed = false;
                                    W.renderViewEditLayout();
                                    W.addSuccessMessage('Your user profile has been updated.');
                                    W.renderInfoView();
                                    W.runtime.send('session', 'profile.saved');
                                    W.runtime.send('profile', 'check');
                                })
                                .catch(function(err) {
                                    W.renderErrorView(err);
                                });
                        }
                    }
                });
                this.runtime.send('ui', 'addButton', {
                    name: 'cancel',
                    label: 'Cancel',
                    style: 'default',
                    icon: 'ban',
                    callback: function() {
                        // Do we have pending changes?
                        // 
                        // var changed = !NAVBAR.findButton('save').prop('disabled');

                        var changed = W.changed;

                        if (changed) {
                            var modal = $('.UserProfileWidget [data-widget-modal="confirm-cancel"]')
                                .modal('show');

                            modal.find('[data-widget-modal-control="confirm-cancel"]').on('click', function(e) {
                                modal
                                    .modal('hide')
                                    .on('hidden.bs.modal', function(e) {
                                        W.changed = false;
                                        W.clearMessages();
                                        W.renderInfoView();
                                    });
                            });
                        } else {
                            W.clearMessages();
                            W.renderInfoView();
                        }
                    }
                });



                /*navbar.setTitle('Editing your profile');
                 navbar.clearButtons();
                 navbar.addButton({
                 name: 'save',
                 label: 'Save',
                 style: 'primary',
                 icon: 'save',
                 disabled: true,
                 callback: function () {
                 if (W.updateUserProfileFromForm()) {
                 W.userProfile.saveProfile()
                 .then(function () {
                 W.renderViewEditLayout();
                 W.addSuccessMessage('Success!', 'Your user profile has been updated.');
                 W.renderInfoView();
                 R.publish('session', 'profile.saved');
                 })
                 .catch(function (err) {
                 W.renderErrorView(err);
                 })
                 .done();
                 }
                 }
                 });
                 navbar.addButton({
                 name: 'cancel',
                 label: 'Cancel',
                 style: 'default',
                 icon: 'ban',
                 callback: function () {
                 // Do we have pending changes?
                 // var changed = !NAVBAR.findButton('save').prop('disabled');
                 var changed = false;
                 
                 if (changed) {
                 var modal = $('.UserProfileWidget [data-widget-modal="confirm-cancel"]')
                 .modal('show');
                 
                 modal.find('[data-widget-modal-control="confirm-cancel"]').on('click', function (e) {
                 modal
                 .modal('hide')
                 .on('hidden.bs.modal', function (e) {
                 W.clearMessages();
                 W.renderInfoView();
                 });
                 });
                 } else {
                 W.clearMessages();
                 W.renderInfoView();
                 }
                 }
                 });
                 */

                this.places.content.html(this.renderTemplate('edit'));

                var widget = this;

                // wire up affiliation add/remove buttons.
                this.places.content.find('[data-button="add-affiliation"]').on('click', function(e) {
                    // grab the container 
                    var affiliations = this.places.content.find('[data-field="profile.userdata.affiliations"]');

                    // render a new affiliation
                    var newAffiliation = this.renderTemplate('new_affiliation', {
                        generatedId: this.genId()
                    });

                    // append to the container
                    affiliations.append(newAffiliation);

                    widget.changed = true;
                    this.runtime.send('ui', 'enableButton', {
                        name: 'save'
                    });

                    // navbar.findButton('save').prop('disabled', false);

                }.bind(this));

                // Wire up remove button for any affiliation.
                this.places.content.find('[data-field="profile.userdata.affiliations"]').on('click', '[data-button="remove"]', function(e) {
                    // remove the containing affiliation group.
                    $(this).closest('[data-field-group="affiliation"]').remove();
                    widget.changed = true;
                    this.runtime.send('ui', 'enableButton', {
                        name: 'save'
                    });
                    // NAVBAR.findButton('save').prop('disabled', false);

                });
                // on any field change events, we update the relevant affiliation panel title
                this.places.content.find('[data-field="profile.userdata.affiliations"]').on('keyup', 'input', function(e) {
                    // remove the containing affiliation group.
                    var panel = $(this).closest('[data-field-group="affiliation"]'),
                        title = panel.find('[data-field="title"] input').val(),
                        institution = panel.find('[data-field="institution"] input').val(),
                        startYear = panel.find('[data-field="start_year"] input').val(),
                        endYear = panel.find('[data-field="end_year"] input').val();
                    endYear = endYear ? endYear : 'present';

                    panel.find('.panel-title').html(title + ' @ ' + institution + ', ' + startYear + '-' + endYear);
                });
                // Monitor changes on the entire form ... if any field is changed we flag the profile as dirty.
                this.places.content.find('form').on('input change', function(e) {
                    // enable the save button.
                    // For now we can also use this as a flag for whether to require confirmation
                    // to leave the profile.
                    widget.changed = true;
                    W.runtime.send('ui', 'enableButton', {
                        name: 'save'
                    });
                });

            }
        },
        /*renderNoProfileView: {
         value: function() {
         this.places.content.html(this.renderTemplate('no_profile'));
         var that = this;
         if (this.isOwner()) {
         $('[data-button="create-profile"]').on('click', function(e) {
         that.createUserRecord({
         success: function() {
         this.recalcState({
         success: function() {
         this.clearMessages();
         this.addSuccessMessage('Success!', 'Your user profile has been created.');
         }.bind(this),
         error: function (err) {
         this.renderErrorView();
         }
         });
         }.bind(that),
         error: function(err) {
         this.renderErrorView(err);
         }.bind(that)
         });
         });
         }
         }
         },
         */

        renderStubProfileView: {
            value: function() {
                this.renderPicture();
                this.places.title.html(this.userProfile.userRecord.user.realname + ' (' + this.userProfile.userRecord.user.username + ')');
                this.places.content.html(this.renderTemplate('stub_profile'));
                var widget = this;
                if (this.isOwner()) {
                    $('[data-button="create-profile"]').on('click', function(e) {
                        widget.userProfile.createProfile()
                            .then(function() {
                                widget.runtime.send('session', 'profile.saved');
                                widget.clearMessages();
                                widget.addSuccessMessage('Your user profile has been created.');
                                widget.render();
                            })
                            .catch(function(err) {
                                widget.renderErrorView(err);
                            });
                    });
                }
            }
        },
        // dom  update utils
        clearErrors: {
            value: function() {
                this.clearMessages();
                this.clearFieldMessages();
                this.places.content.find('.has-error').removeClass('has-error');
                this.places.content.find('.error-message').removeClass('error-message');
                this.formHasError = false;
            }
        },
        clearFieldMessages: {
            value: function() {
                $('[data-field-message]').empty();
            }
        },
        renderPicture: {
            value: function() {
                this.container
                    .find('[data-placeholder="picture"]')
                    .html(this.renderTemplate('picture'));
            }
        },
        renderViewEditLayout: {
            value: function() {
                if (this.isOwner()) {
                    this.runtime.send('ui', 'setTitle', 'Viewing your profile');
                } else {
                    var title = this.userProfile.getProp('user.realname') + ' (' + this.userProfile.getProp('user.username') + ')';
                    this.places.title.html(title);
                    this.runtime.send('ui', 'setTitle', 'Viewing profile for ' + title);
                }
                nunjucks.configure({
                    autoescape: true
                });
                this.container.html(this.renderTemplate('view_edit_layout'));
                // These are just convenience placeholders.
                this.places = {
                    title: this.container.find('[data-placeholder="title"]'),
                    alert: this.container.find('[data-placeholder="alert"]'),
                    content: this.container.find('[data-placeholder="content"]')
                };
            }
        },
        renderLayout: {
            value: function() {
                nunjucks.configure({
                    autoescape: true
                });
                this.container.html(this.renderTemplate('layout'));
                this.places = {
                    title: this.container.find('[data-placeholder="title"]'),
                    content: this.container.find('[data-placeholder="content"]')
                };
            }
        }

    });

    return UserProfileWidget;
});