import { Template } from 'meteor/templating';
import { Paiements } from '/imports/api/paiements/paiements.js';
import './etatsPaiementsActionBtns.html';


Template.etatsPaiementsActionBtns.helpers({
    montantPaye: function () {
        let somme = 0;
        if (this.contrat.ref_contrat) {

            let p = Paiements.findOne({ _id: this.contrat.ref_contrat });
            return p ? p.total : 0;
            //console.log('la somme' + somme);
        }
        return 0;
    }
});





