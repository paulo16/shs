import { Template } from 'meteor/templating';
import moment from 'moment';
import './PaiementsActionBtns.html';


Template.PaiementsActionBtns.events({

    'click #btnUpdate': function () {
        //console.log('this - ' + JSON.stringify(this));
        Session.set('PaiementData', this);
    },

    'click #btnRemove': function () {
        let date = moment(this.date_paiement_manuelle).format('DD-MM-YYYY HH:mm:ss');
        let id = this._id;
        swal({
            title: "Êtes-vous sûr de vouloir supprimer ce paiement ?",
            text: " paiement de " + this.montant + " dh , du client " + this.client.cin + ", date paiement : " + date + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: '#d33',
            confirmButtonText: "Oui, valider !",
            cancelButtonText: 'Non,annuler',
            closeOnConfirm: false,
            html: false
        }, function () {

            Meteor.call('removePaiement', id, function (error, result) {
                if (error) {
                    swal("Oups", " Problème ,suppresion non éffectuée", "error");
                }
                else {
                    swal("OK!", "Suppression bien éffectuée :) .", "success");
                }
            });

        });

    }

});



