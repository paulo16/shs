import {
    Template
} from 'meteor/templating';
import {
    Accounts
} from 'meteor/accounts-base';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import './addClient.html';

Template.compoAddClient.events({
            'submit #add-client': function (e) {
                event.preventDefault();

                let nom = $('#nom').val();
                let prenom = $('#prenom').val();
                let cin = $('#cin').val();
                let phone = $('#phone').val();
                let province = $('#province').val();
                let commune = $('#commune').val();
                let village = $('#village').val();
                let ref_contrat = $('#ref_contrat').val();

                let date_mise_service = $('#date_mise_service').val();
                let tab = date_mise_service.split("-");
                let datefin = new Date(tab[2], tab[1] - 1, tab[0]);
                console.log('date :' + JSON.stringify(tab[2]));

                    let client;
                    let contrat; contrat = {
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
                        phone: phone,
                        contrat: contrat

                    };
                    /*
                     Meteor.call('insertClient', client, function (error, result) {
                         if (error) {
                             console.log(error);
                             swal("Oups", " Problème ,client non crée", "error");
                         } else {
                             console.log(result);
                             swal("OK!", "Client bien crée.", "success");
                             FlowRouter.go('listClients');
                         }
                     });
                     */

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

            lesprovinces: function () {

                Meteor.call('listeProvinces', (error, results) => {
                    let content = '';
                    if (error) {
                        console.log(error);
                    } else {
                        content = '<select id="province" class="form-control select2" style="width: 50% ;text-align:center">';
                        content += '<option value="">Toutes les provinces</option>';

                        for (var i = 0; i < results.length; i++) {
                            content += '<option value="' + results[i] + '">' + results[i] + '</option>';
                        }
                        content += '</select>';
                        $('.select-province').html(content);
                    }
                });

            },


            lescommunes: function () {

                Meteor.call('listeCommunes', (error, results) => {
                    let content = '';
                    if (error) {
                        console.log(error);
                    } else {
                        content = '<select id="commune" class="form-control select2" style="width: 50% ;text-align:center">';
                        content += '<option value="">Toutes les communes</option>';

                        for (var i = 0; i < results.length; i++) {
                            content += '<option value="' + results[i] + '">' + results[i] + '</option>';
                        }
                        content += '</select>';
                        $('.select-commune').html(content);
                    }
                });

            },
            lesvillages: function () {

                Meteor.call('listeVillages', (error, results) => {
                    let content = '';
                    if (error) {
                        console.log(error);
                    } else {
                        content = '<select id="village" class="form-control select2" style="width: 50% ;text-align:center">';
                        content += '<option value="">Toutes les villages</option>';

                        for (var i = 0; i < results.length; i++) {
                            content += '<option value="' + results[i] + '">' + results[i] + '</option>';
                        }
                        content += '</select>';
                        $('.select-village').html(content);
                    }
                });

            }
        });