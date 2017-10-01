import { Template } from 'meteor/templating';

import './ClientsActionBtns.html';


Template.ClientsActionBtns.events({

    'click #btnUpdate': function () {
        Session.set('ClientData', this);
    },

    'click #btnRemove': function () {
        let date = moment(this.contrat.date_mise_service).format('DD-MM-YYYY HH:mm:ss');
        let id = this._id;
        swal({
            title: "Êtes-vous sûr de vouloir supprimer ce client ?",
            text: " client de cin " + this.cin + " dh ,et de contrat " + this.contrat.ref_contrat + ", avec la date de mise en service : " + date + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: '#d33',
            confirmButtonText: "Oui, valider !",
            cancelButtonText: 'Non,annuler',
            closeOnConfirm: false,
            html: false
        }, function () {

            Meteor.call('removeClient', id, function (error, result) {
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
