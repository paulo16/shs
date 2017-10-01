import { Template } from 'meteor/templating';

import './TmplModalUpdateEtatsPaiements.html';

Template.TmplModalUpdateEtatsPaiements.helpers({
    paiement: function () {
        //console.log('dans la form' + JSON.stringify(Session.get('PaiementData')));
        let paiement = Session.get('PaiementData');
        return paiement;
    }
});
