var app = new Vue({
    el: '#app',
    data: {
        event: { movement: '', weight: '', measurement: '', date: '', user: '' },
        events: [],
        authenticated: false,
        secretThing: '',
        user: {
            username: '',
            password: ''
        },
        userEmail: '',
        movements: [
            { movement: 'Back squat' },
            { movement: 'Box jump' },
            { movement: 'Clean and jerk' },
            { movement: 'Deadlift' },
            { movement: 'Front squat' },
            { movement: 'Overhead squat' },
            { movement: 'Power clean' },
            { movement: 'Power snatch' },
            { movement: 'Push jerk' },
            { movement: 'Push press' },
            { movement: 'Shoulder press' },
            { movement: 'Squat clean' },
            { movement: 'Squat snatch' },
            { movement: 'Split jerk' },
            { movement: 'Strict press' },
            { movement: 'Sumo deadlift' },
            { movement: 'Thruster' },
            { movement: 'Turkish get up' }
        ],
        editingEvent: {},
        selectedEvent: 0,
        graphMovement: [],
        chartData: [
            ["Jan", 4],
            ["Feb", 2],
            ["Mar", 10],
            ["Apr", 5],
            ["May", 3]
        ],
        graphOn: false
    },
    beforeMount: () => {
        backand.init && backand.init({
            appName: 'crossfit',
            signUpToken: '21748cf1-82d2-4e06-9883-8e465f5f88cb',
            anonymousToken: '6ffef82b-33ae-4436-b0b8-9369d7eba326',
            runSocket: true
        });
        console.log("1");
    },
    mounted: function() {
        console.log("2");
        // console.log(this.authenticated);
        if (JSON.parse(localStorage.getItem('username')) && JSON.parse(localStorage.getItem('auth'))) {
            this.authenticated = JSON.parse(localStorage.getItem(['auth']));
            console.log(JSON.parse(localStorage.getItem('username')));
            console.log(JSON.parse(localStorage.getItem('auth')));
            this.fetchEvents();
        };
    },
    methods: {
        checkAuth: function() {
            backand.signin(this.user.username, this.user.password)
                .then(res => {
                    console.log('signin succeeded with user:' + res.data.username);
                    this.authenticated = true;
                    console.log(this.authenticated);
                    localStorage.setItem('auth', true);
                    localStorage.setItem('username', JSON.stringify(res.data.username));
                    localStorage.setItem('profile', JSON.stringify(res.data));
                    console.log(JSON.parse(localStorage.getItem(['auth'])));
                    console.log(JSON.parse(localStorage.getItem(['username'])));
                    console.log(JSON.parse(localStorage.getItem('profile')));
                    this.user.username = "";
                    this.user.password = "";
                    this.fetchEvents();
                })
                .catch(err => {
                    console.log(err);
                });
        },

        fetchEvents: function() {
            var events = [];
            let options = {
                "pageSize": 20,
                "pageNumber": 1,
                "filter": [{
                    "fieldName": "user",
                    "operator": "equals",
                    "value": JSON.parse(localStorage.getItem(['username']))
                }],
                "sort": []
            }
            backand.object.getList('movements', options)
                .then((response) => {
                    this.events = [];
                    console.log(response);
                    for (i = 0; i < response.data.length; i++) {
                        if (response.data[i].user == JSON.parse(localStorage.getItem(['username']))) {
                            this.events.push({
                                id: JSON.parse(response.data[i].id),
                                movement: response.data[i].movement,
                                weight: JSON.parse(response.data[i].weight),
                                measurement: response.data[i].measurement,
                                date: response.data[i].date,
                                user: response.data[i].username
                            });
                        }
                    }
                    // this.$set('events', events);
                    console.log(this.events);
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        editEvent: function(event) {
            this.editingEvent = event;
        },

        remove: function(event) {
            backand.object.remove('movements', event.id)
                .then(res => {
                    console.log('deleted');
                    this.fetchEvents();
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        endEditing: function(event) {
            console.log(event.id);
            backand.object.update('movements', event.id, event)
                .then(res => {
                    this.editingEvent = {};
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        logout: function() {
            backand.signout()
                .then(res => {
                    this.authenticated = false;
                    localStorage.removeItem('profile');
                    this.userEmail = "";
                    localStorage.removeItem('auth');
                    localStorage.removeItem('username');
                    console.log('signout succeeded');
                    this.events = [];
                })
                .catch(err => {
                    console.log(err);
                });
        },

        addEvent: function() {
            if (this.event.movement.trim()) {
                console.log(this.event);
                // this.event.id;
                console.log("id = " + this.event.id);
                this.event.user = JSON.parse(localStorage.getItem('username'));
                console.log("user = " + JSON.parse(localStorage.getItem('username')));
                this.events.push(this.event);
                console.log('Event added!' + this.event);
                console.log("Events are " + this.events);

                // Sample code with options and additional parameters
                let options = {
                    returnObject: true
                };
                let parameters = {
                    movement: this.event
                };
                backand.object.create('movements', this.event)
                    .then(res => {
                        console.log('object created');
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            console.log(this.events);
        },

        selectEvent: function(event) {
            this.selectedEvent = event;
            console.log('clicked');
            console.log(this.selectedEvent);
        },

        setGraph: function(movementName) {
            var m = movementName;
            console.log(JSON.stringify(m));
            console.log(m);
            this.graphMovement = [];
            var allRecords = this.events;
            for (i = 0; i < this.events.length; i++) {
                if (this.events[i].movement == m) {
                    console.log(this.events[i].movement)
                    this.graphMovement.push([
                        this.events[i].date,
                        this.events[i].weight
                    ])
                }
            }
            this.graphOn = true;
            console.log(this.chartData);
            console.log(this.graphMovement);
        },

        showTable: function() {
            this.graphOn = false;
        }


    },
    filters: {
        moment: function(date) {
            return moment(date).format('DD MMMM YYYY');
        },
        rounding: function(number, decimal_places) {
            if (typeof number === 'number' && typeof decimal_places === 'number') {
                var denominator = Math.pow(10, decimal_places),
                    rounded_number = Math.round(number * denominator) / denominator;

                return rounded_number;
            } else {
                return number;
            }
        }
    }
});