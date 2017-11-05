import {
    Meteor
} from 'meteor/meteor';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
import {
    FlowRouterMeta,
    FlowRouterTitle
} from 'meteor/ostrio:flow-router-meta';
import {
    BlazeLayout
} from 'meteor/kadira:blaze-layout';
import '../../ui/layouts/adminTo/appLayout.js';
import '../../ui/pages/adminTo/home/dashboard.js';
import '../../ui/pages/adminTo/not-found/not-found.js';
import '../../ui/pages/adminTo/users/addUser.js';
import '../../ui/pages/adminTo/uploads/clients.js';
import '../../ui/pages/adminTo/uploads/paiements.js';
import '../../ui/pages/adminTo/clients/listClients.js';
import '../../ui/pages/adminTo/clients/addClient.js';
import '../../ui/pages/adminTo/clients/profileClient.js';
import '../../ui/pages/adminTo/synchro/synchro.js';
import '../../ui/pages/adminTo/paiements/effectuerPaiement.js';
import '../../ui/pages/adminTo/statistiques/StatsProvinceAnnees.js';
import '../../ui/pages/adminTo/auth/login.js';
import '../../ui/pages/adminTo/auth/register.js';


Accounts.onLogin(function (user) {

    redirect = Session.get('redirectAfterLogin');
    if (redirect && redirect != '/login') {
        FlowRouter.go(redirect)
    }

});



let publicRoutes = FlowRouter.group({
    name: 'public'
});


publicRoutes.route('/login', {
    name: 'login',
    action() {
        BlazeLayout.render('login')
    }

});

publicRoutes.route('/register', {
    name: 'register',
    action() {
        BlazeLayout.render('register')
    }

});


publicRoutes.route('/logout', {
    name: 'logout',
    action() {
        Accounts.logout();
        FlowRouter.go('/login');
    }
});


/** 
 * ******** LOGIN ************** 
 * */

let authenticatedRoutes = FlowRouter.group({
    name: 'authenticated',
    triggersEnter: [(context, redirect) => {
        if (!Meteor.loggingIn() && !Meteor.userId()) {
            route = FlowRouter.current();
            if (route.route.name != 'login') {
                Session.set('redirectAfterLogin', route.path);
            }
            FlowRouter.go('login');
        }
    }]
});

authenticatedRoutes.route('/', {
    name: 'dashboard',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "dashboard"
        });
    },
});

authenticatedRoutes.route('/paiements', {
    name: 'lesPaiements',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "listPaiements"
        });
    }
});


authenticatedRoutes.route('/etats-paiements-clients', {
    name: 'etatsPaiements',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "etatsPaiements"
        });
    }
});

authenticatedRoutes.route('/effectuer-paiement', {
    name: 'effectuerPaiement',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "effectuerPaiement"
        });
    },
});

authenticatedRoutes.route('/uploader-paiements', {
    name: 'uploaderPaiements',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "uploaderPaiements"
        });
    },
});

authenticatedRoutes.route('/add-user', {
    name: 'addUser',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "addUser"
        });
    },
});

authenticatedRoutes.route('/users', {
    name: 'listUsers',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "listUsers"
        });
    },
});

authenticatedRoutes.route('/uploader-clients', {
    name: 'uploaderClients',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "uploaderClients"
        });
    },
});

authenticatedRoutes.route('/clients', {
    name: 'listClients',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "listClients"
        });
    },

});

authenticatedRoutes.route('/add-client', {
    name: 'AddClient',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "AddClient"
        });
    },
});

authenticatedRoutes.route('/profile-client', {
    name: 'profile',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "profileClient"
        });
    },
});

authenticatedRoutes.route('/stats-province-annee', {
    name: 'PageStatsProvinceAnnees',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "PageStatsProvinceAnnees"
        });
    },
});

// Synchronisation 
authenticatedRoutes.route('/synchronisation', {
    name: 'synchronisation',
    action: function () {
        BlazeLayout.render("appLayout", {
            yield: "synchro"
        });
    },
});

authenticatedRoutes.route('/save-paiement-agent', {
    name: 'paiementagent',
    action: function () {
        let currentUrl = FlowRouter.current();
        let data = currentUrl.queryParams;
        console.log(data);

        Meteor.call('paiementsTranscation', data, (result, error) => {
            if (result == true) {
                return true;
            } else if (error) {
                console.log(error);
            }
        })
    },
});

FlowRouter.notFound = {

    action: function () {
        BlazeLayout.render("App_notFound");

    }
};


new FlowRouterMeta(FlowRouter);
new FlowRouterTitle(FlowRouter);