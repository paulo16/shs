import { Template } from 'meteor/templating';
import moment from 'moment';

import './TmplModalUpdateClient.html';

Template.TmplModalUpdateClient.helpers({
    client: function () {
        //console.log('dans la form' + JSON.stringify(Session.get('ClientData')));
        let client = Session.get('ClientData');
        if (client) {
            let date = moment(client.contrat.date_mise_service).format('DD-MM-YYYY HH:mm:ss');
            client.contrat.date_mise_service = date;
            return client;
        }
        return {};

    }
});

Template.TmplModalUpdateClient.events({
    'submit #form-updateclient': function (event, template) {
        event.preventDefault();
        if ($('#_id').val()) {
            let cin = $('#cin').val();
            let ref_contrat = $('#ref_contrat').val();
            let nom = $('#nom').val();
            let prenom = $('#prenom').val();

            var t = $('#date-mise-service').val().split(/[- :]/);
            var date = new Date(t[2], t[1] - 1, t[0], t[3], t[4], t[5]);

            let client = {
                _id: $('#_id').val(),
                cin: cin,
                nom: nom,
                prenom: prenom,
                contrat: {
                    ref_contrat: ref_contrat,
                    date_mise_service: date
                }
            };

            Meteor.call('updateClient', client, (err, id) => {
                if (err) {
                    swal(
                        'Oops...',
                        'Pétit problème, mise à jour non éffectué :( !',
                        'error'
                    );
                } else {
                    swal(
                        'Bien!',
                        'Mise à jour client bien éffectuée :)',
                        'success'
                    );
                }

            });

        }
    }
});

Template.TmplModalUpdateClient.onRendered(function () {
    $("#form-updateclient").validate({
        rules: {
            cin: {
                required: true,
            },
            nom: {
                required: true,
            },
            prenom: {
                required: true,
            },
            "date-mise-service": {
                required: true
            },
            'ref_contrat': {
                required: true,
            }
        },
        messages: {
            cin: {
                required: 'Cin obligatoire',
            },
            nom: {
                required: 'Nom obligatoire',
            },
            prenom: {
                required: 'Prenom obligatoire',
            },
            "date-mise-service": {
                required: 'Date mise en service obligatoire'
            },
            'ref_contrat': {
                required: 'Contrat obligatoire',
            }
        },
    });

    this.$('.datetimepicker').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss',
        lang: 'fr'
    });
});