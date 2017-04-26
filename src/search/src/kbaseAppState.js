define(['kb.statemachine', 'kb.config', 'kb.session', 'postal'], function (StateMachine, Config, Session, Postal) {
    /**
    The app state is a specialized state machine with the following properties:
    methods for adding, updating, and listening for the kbase global app state
    properties:
    auth
    session
    userprofie
    config
   
    If you are templated, please do not extend the app state with state for your specific
    view. You should create a state machine in your view controller and provide that to your
    widgets for communicating state change.
    */
    var AppState = Object.create(StateMachine, {
        init: {
            value: function (cfg) {
                Object.getPrototypeOf(this).init.call(this, cfg);

                // NB: both of these items are at present singletons, but that was mostly to
                // solve the global state problem, which this appstate object does on its own.
                // The config and session objects should be returned to being standard objects, 
                // which we can initialize here.
                // Furthermore, we can monitor changes in their state here too, e.g. a timer which
                // checks for changes and alters the state.
                this.setItem('config', Config);
                this.setItem('session', Session);
                // just a subset of the me structure


                Postal.channel('session').subscribe('me.loaded', function (data) {
                    this.setItem('me', data.me);
                }.bind(this));

                Postal.channel('session').subscribe('profile.loaded', function (data) {
                    this.setItem('userprofile', data.profile);
                }.bind(this));

                Postal.channel('session').subscribe('profile.loadfailure', function (data) {
                    this.setError('userprofile', data.error);
                }.bind(this));

                return this;
            }
        }
    });

    return AppState.init();
});