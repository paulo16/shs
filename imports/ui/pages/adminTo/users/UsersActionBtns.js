import { Template } from 'meteor/templating';
import moment from 'moment';
import './UsersActionBtns.html';


Template.UsersActionBtns.events({

    'click #btnUpdate': function () {
        //console.log('this - ' + JSON.stringify(this));
        Session.set('UserData', this);
    },

    'click #btnRemove': function () {
        let id = this._id;
        swal({
            title: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
            text: " Utilisateur de nom " + this.profile.lastName + " et de numéro " + this.profile.numero_agent + " !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: '#d33',
            confirmButtonText: "Oui, valider !",
            cancelButtonText: 'Non,annuler',
            closeOnConfirm: false,
            html: false
        }, function () {

            Meteor.call('removeUser', id, function (error, result) {
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



