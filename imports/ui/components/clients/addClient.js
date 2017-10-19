import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import './addClient.html';

Template.compoAddClient.events({
    'submit #add-client': function (e) {
        event.preventDefault();

        let nom = $('#nom').val();
        let prenom = $('#prenom').val();
        let cin = $('#cin').val();
        let province = $('#province').val()
        let commune = $('#commune').val()
        let village = $('#village').val();
        let ref_contrat = $('#ref_contrat').val();
        let date_mise_service = $('#date_mise_service').val();
        let tabdatefin = date_mise_service.split("-");
        let datefin = new Date(tabdatefin[2], tabdatefin[1] - 1, tabdatefin[0]);

        let client;
        let contrat;
        contrat = {
            ref_contrat: ref_contrat,
            date_mise_service: datefin
        };

        client = {
            nom: nom,
            prenom: prenom,
            cin: cin,
            province: province,
            commune: commune,
            village: village,
            contrat: contrat
        };

        Meteor.call('insertClient', client, function (error, result) {
            if (error) {
                console.log(error);
                swal("Oups", " Problème ,client non crée", "error");
            }
            else {
                console.log(result);
                swal("OK!", "Client bien crée.", "success");
                FlowRouter.go('/clients');
            }
        });

    }

});

Template.compoAddClient.onRendered(function () {
    $("#add-client").validate({
        rules: {
            nom: {
                required: true
            },
            cin: {
                required: true,
                minlength: 2
            },
            'ref_contrat': {
                required: true
            },
            'date_mise_service': {
                required: true
            }
        },
        messages: {
            nom: {
                required: 'Nom obligatoire'
            },
            cin: {
                required: 'CIN obligatoire'
            },
            'date_mise_service': {
                required: 'Date Mise en service obligatoire'
            },
            'ref_contrat': {
                required: 'Numéro contrat obligatoire'
            }
        },
    });

    this.$('.datetimepicker').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss',
        lang: 'fr'
    });
});

Template.compoAddClient.helpers({
    datenow() {
        let date = moment(new Date()).format('DD-MM-YYYY HH:mm:ss');
        return date;
    },
});