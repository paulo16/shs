import { Meteor } from 'meteor/meteor';
import './synchro.html';

Template.synchro.onCreated(() => {
    Template.instance().synchroclients = new ReactiveVar(false);
    Template.instance().synchropaiements = new ReactiveVar(false);
    Template.instance().synchrousers = new ReactiveVar(false);
});

Template.synchro.helpers({
    synchroclients() {
        return Template.instance().synchroclients.get();
    },
    synchropaiements() {
        return Template.instance().synchropaiements.get();
    },
    synchrousers() {
        return Template.instance().synchrousers.get();
    }
});

Template.synchro.events({
    'click #synchroclients'(event, template) {
        template.synchroclients.set(true);

        Meteor.call('synchroClients', (error, response) => {
            console.log(" Fin de synchro des clients");
            if (error) {
                console.log(error);
                template.synchroclients.set(false);
            } else if (response) {
                console.log(response);
                template.synchroclients.set(false);
                Bert.alert('Synchronisation clients complete!', 'success', 'growl-top-right');
            }
        });
    },

    'click #synchropaiements'(event, template) {
        template.synchropaiements.set(true);

        Meteor.call('synchroPaiements', (error, response) => {
            console.log(" Fin de synchro des Paiements");
            if (error) {
                console.log(error);
                template.synchropaiements.set(false);
            } else if (response) {
                console.log(response);
                template.synchropaiements.set(false);
                Bert.alert('Synchronisation Paiements complete!', 'success', 'growl-top-right');
            }
        });
    },

    'click #synchrousers'(event, template) {
        template.synchrousers.set(true);

        Meteor.call('synchroUsers', (error, response) => {
            console.log(" Fin de synchro des users");
            if (error) {
                console.log(error);
                template.synchrousers.set(false);
            } else if (response) {
                console.log(response);
                template.synchrousers.set(false);
                Bert.alert('Synchronisation Users complete!', 'success', 'growl-top-right');
            }
        });
    }

});