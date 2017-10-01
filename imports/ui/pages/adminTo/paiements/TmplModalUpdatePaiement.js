import { Template } from 'meteor/templating';
import moment from 'moment';

import './TmplModalUpdatePaiement.html';

Template.TmplModalUpdatePaiement.helpers({
    paiement: function () {
        //console.log('dans la form' + JSON.stringify(Session.get('PaiementData')));
        let paiement = Session.get('PaiementData');
        if (paiement) {
            let date = moment(paiement.date_paiement_manuelle).format('DD-MM-YYYY HH:mm:ss');
            paiement.date_paiement_manuelle = date;
            return paiement;
        }
        return {};

    }
});

Template.TmplModalUpdatePaiement.events({
    'submit #form-updatepaye': function (event, template) {
        event.preventDefault();
        if ($('#_id').val() && $('#montant').val() && $('#date-paiement').val()) {

            var t = $('#date-paiement').val().split(/[- :]/);
            var date = new Date(t[2], t[1] - 1, t[0], t[3], t[4], t[5]);

            let paiement = {
                _id: $('#_id').val(),
                montant: $('#montant').val(),
                date_paiement_manuelle: date
            };

            Meteor.call('updatePaiement', paiement, (err, id) => {
                if (err) {
                    swal(
                        'Oops...',
                        'Pétit problème, mise à jour non éffectué :( !',
                        'error'
                    );
                } else {

                    if (id != undefined && id != '') {
                        console.log('generate pdf id -' + id);
                        Meteor.call('generate_pdf', id, (err, res) => {
                            if (err) {
                                swal(
                                    'Oops...',
                                    'la géneration du nouveau pdf a échoué :( !',
                                    'error'
                                )
                            } else {
                                swal(
                                    'Bien!',
                                    'Mise à jour et regéneration du pdf bien éffectuées ',
                                    'success'
                                )
                            }
                        });
                    }
                }

            });

        }
    }
});

Template.TmplModalUpdatePaiement.onRendered(function () {
    $("#form-updatepaye").validate({
        rules: {
            "date-paiement": {
                required: true
            },
            montant: {
                required: true,
                min: 30
            }
        },
        messages: {
            "date-paiement": {
                required: 'Date Paiement obligatoire'
            },
            montant: {
                required: 'Montant de Paiement obligatoire',
                min: 'le montant doit etre supérieur à 30'
            }
        },
    });

    this.$('.datetimepicker').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss',
        lang: 'fr'
    });
});