import {
    Meteor
} from 'meteor/meteor';
import moment from 'moment';
import {
    Template
} from 'meteor/templating';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
//import { Pdfs } from '/imports/api/pdfs/pdfs.js';
import pdf from 'html-pdf';
import 'meteor/themeteorchef:jquery-validation';
import 'meteor/mrt:nprogress';
import 'meteor/kevohagan:sweetalert';
import 'meteor/natestrauser:select2';
import './effectuerPaiement.html';


let infoClient;

Template.effectuerPaiement.onCreated(() => {
    let currentUrl = FlowRouter.current();
    let contrat = currentUrl.params;
    //console.log('contrat: '+JSON.stringify(contrat));

    Template.instance().genrecu = new ReactiveVar(false);
    Session.set('idpaiement', '');
    Session.set('contrat', contrat.ref_contrat);
    Session.set('showhistorique', 'false');
});

Template.effectuerPaiement.helpers({
    genrecu() {
        return Template.instance().genrecu.get();
    },

    datenow() {
        let date = moment(new Date()).format('DD-MM-YYYY HH:mm:ss');
        return date;
    },
});

Template.effectuerPaiement.events({
    'keyup #input-search': function (event, template) {

        //info sur le client 

        //Historique des paiements 
        if ($('#input-search').val() != "" && $('#input-search').val().length >= 5) {


            Meteor.call('findClient', $('#input-search').val(), function (error, result) {
                if (error) {
                    ////console.log(error);
                } else {
                    ////console.log(result);
                    let content = '<span> Aucun résulat trouvé</span>';
                    if (result && result != undefined && result != "") {
                        Session.set('cin', result.cin);
                        infoClient = result;
                        content = '' +
                            '<div>' +
                            '<img src="/images/customer.png" width="65px" height="65px" class="user-profile-image img-circle" alt="">' +
                            '<span class="text-center m-t-lg"><B>&nbsp;' + result.nom + '&nbsp;&nbsp;' + result.prenom + '</B></span>' +
                            '<span><i class="icon-pointer m-r-xs"></i>&nbsp;&nbsp;&nbsp;Province :&nbsp;&nbsp;' + result.province + ' , <b>Commune</b> : ' + result.commune + ' , <b>Village</b>: ' + result.village + ', <br> <b>Cin:</b>' + result.cin + ' </span>' +
                            '<span><i class="icon-envelope-open m-r-xs"></i><a href="#">;&nbsp;&nbsp Date Mise en Service : &nbsp;' + moment(result.contrat.date_mise_service).format("DD-MM-YYYY HH:mm") + '</a></span>' +
                            '</div>';
                    }
                    $('#info-client').html(content);
                }
            });

            showhistorique();

        } else {
            $('#historique-paie').html('');
            $('#info-client').html('');
        }
    },

    'click #refresh': function (event, template) {
        showhistorique();
    },
    'click #cacher': function (event, template) {
        showhistorique();
        if (Session.get('showhistorique') == false) {
            $('#show-historique').show();
            Session.set('showhistorique', true);

        } else {
            $('#show-historique').hide();
            Session.set('showhistorique', false);
        }
    },

    'keyup #mois': function (event, template) {
        event.preventDefault();
        let mois = event.target.value;
        let m = mois * 30;
        $("#montant").val(mois * 30);
    },

    'keyup #montant': function (event, template) {
        event.preventDefault();
        let mois = event.target.value;
        $("#mois").val(mois / 30);
    },

    'change #type-paie': function (event, template) {
        event.preventDefault();
        $("#virement").append('');
        let valeur = event.target.value;
        ////console.log('la valeur ' + valeur);
        if (valeur == "Virement Banquaire" || valeur == "Paiement Chèque") {
            $("#virement").show();
        } else {
            $("#virement").hide();
        }
    },

    'submit #form-paye': function (event, template) {
        event.preventDefault();
        let montant = parseInt($('#montant').val());
        if (infoClient != '' && infoClient != undefined && montant != '') {
            //console.log('info-client : ' + JSON.stringify(infoClient));
            let paiement;
            let virement;
            let agent;
            let client;
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            });
            let t = $('#date-paiement').val().split(/[- :]/);
            let date_paie = new Date(t[2], t[1] - 1, t[0], t[3], t[4], t[5]);

            if ($('#type-paie').val() == "Virement Banquaire" || $('#type-paie').val() == "Paiement Chèque") {
                virement = {
                    numero_virement: $('#mum-virement').val(),
                    banque: $('#banque').val()
                }

            }

            agent = {
                numero_agent: user.profile.numero_agent,
                lastName: user ? user.profile.lastName : ''
            };
            client = {
                ref_contrat: infoClient.contrat.ref_contrat,
                nom: infoClient.nom,
                cin: infoClient.cin,
                province: infoClient.province,
                commune: infoClient.commune,
                village: infoClient.village,
                date_mise_service: infoClient.contrat.date_mise_service
            }

            paiement = {
                agent: agent,
                client: client,
                montant: montant,
                recu_pdf: moment(new Date()).format("DD-MM-YYYY-HH-mm-ss") + '-pdf-absent',
                emeteur_paiement_cin: $("#expediteur").val() ? $("#expediteur").val() : '',
                virement: virement,
                date_paiement_auto: new Date(),
                date_paiement_manuelle: date_paie,
                type_paiement: $("#type-paie").val()
            };

            swal({
                title: "Effectuer le paiement de " + Math.floor(montant / 30) + " écheance(s) , Etes vous sur ?",
                text: " une fois éffectué , vous ne pourriez plus le redéfinir!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: '#d33',
                confirmButtonText: "Oui, valider !",
                cancelButtonText: 'Non,annuler',
                closeOnConfirm: false,
                html: false
            }, function () {
                swal({
                    title: 'Sweet!',
                    text: 'Veillez Patienter svp !',
                    imageUrl: '/images/Ellipsis.gif',
                    imageWidth: 400,
                    imageHeight: 200,
                    showConfirmButton: false,
                    imageAlt: 'patienter',
                    animation: false
                });

                Meteor.call('insertPaiement', paiement, function (error, res) {
                    if (error) {
                        //console.log(error);
                        swal("Oups", " Problème ,validation non éffectué", "error");
                    } else if (res != null) {

                        template.genrecu.set(false);
                        let url = '/cfs/files/' + res.collectionName + '/' + res._id + '/' + res.original.name;
                        //console.log("la reponse serveur:" + JSON.stringify(res._id) + 'mon url' + url);
                        Meteor.setTimeout(function () {
                            window.open(url, '_blank');
                        }, 1000);
                        swal({
                            type: 'success',
                            title: 'Paiement Bien éffectué !!',
                            showConfirmButton: false,
                        });
                        $('#montant').val('');
                        $("#mois").val('');
                    } else {
                        template.genrecu.set(false);
                        swal("Oups...", "Pétit problème ,Impossible de génerer pdf !", "error");
                    }
                });

            });

        } else if (infoClient == undefined) {
            swal("Oups...", "Pétit problème ,veillez choisir un client tout d'abors !", "error");
        }

    },

    'click #print': function (event, template) {
        event.preventDefault();
        template.genrecu.set(true);
        Meteor.call('generate_pdf', Session.get('idpaiement'), function (err, res) {
            if (err) {
                console.error(err);
                template.genrecu.set(false);
            } else if (res != null) {

                template.genrecu.set(false);
                let url = '/cfs/files/' + res.collectionName + '/' + res._id + '/' + res.original.name;
                //console.log("la reponse serveur:" + JSON.stringify(res._id) + 'mon url' + url);
                Meteor.setTimeout(function () {
                    window.open(url, '_blank');
                }, 1000);
            } else {
                template.genrecu.set(false);
                swal("Oups...", "Pétit problème ,Impossible de génerer pdf !", "error");
            }
        });

    },
});


Template.effectuerPaiement.onRendered(function () {

    if (Session.get('contrat')) $("#input-search").val(Session.get('contrat'));

    $('#show-historique').hide();

    $("#form-paye").validate({
        rules: {
            "date-paiement": {
                required: true
            },
            'type-paie': {
                required: true,
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
            'type-paie': {
                required: 'Type de Paiement obligatoire'
            },
            montant: {
                required: 'Montant de Paiement obligatoire',
                min: 'le montant doit etre supérieur à 30'
            }
        },
    });
    //les initialisations
    $("#impression").hide();
    //$(".select2").select2();
    $("#virement").hide();


    this.$('.datetimepicker').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss',
        lang: 'fr'
    });
});

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}


function showhistorique() {
    Meteor.call('findHistorique', $('#input-search').val(), function (error, result1) {
        if (error) {
            console.log(error);
        } else if (result1 != undefined && result1 != '') {
            //console.log(result);
            //let content = '<span> Aucun résulat trouvé</span>';
            let dataset = [
                ["", "", "", "", ""]
            ];
            Session.set('result1', result1);
            let res1 = Session.get('result1');
            if (res1 && res1 != undefined && res1 != "") {

                let contenu;
                let lien;
                res1.forEach(function (element) {
                    if (element) {

                        if (element.recu_pdf) {
                            lien = element.recu_pdf.replace(/.*pdfs\\/, "");
                        }
                        if (typeof element.type_paiement === undefined) {
                            element.type_paiement = "";

                        }

                        if (!element.agent.lastName) {
                            element.agent.lastName = 'vide';
                        }

                        contenu = [
                            element.agent.lastName,
                            element.client.cin,
                            moment(element.date_paiement_auto).format("DD-MM-YYYY HH:mm"),
                            lien,
                            //element.type_paiement,
                            element.montant

                        ];
                        dataset.push(contenu);
                    }
                })


            }
            $("#table-historique").dataTable({
                data: dataset,
                destroy: true,
                pageLength: 3,
                dom: '<tip>',
                "oLanguage": {
                    "sProcessing": "Traitement en cours  ...",
                    "sSearch": "Rechercher&nbsp;:",
                    "sLengthMenu": "Afficher _MENU_ ",
                    "sInfo": "Affichage de l' &eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
                    "sInfoEmpty": "Affichage de l\&eacute;l&eacute;ment0&agrave;0sur0&eacute;l&eacute;ments",
                    "sInfoFiltered": "filtr&eacute; de _MAX_ &eacute; l&eacute;mentsautotal",
                    "sInfoPostFix": "",
                    "sLoadingRecords": "Chargement en cours...",
                    "sZeroRecords": "Aucun &eacute;l&eacute;ment &agrave; afficher",
                    "sEmptyTable": "Aucune donn&eacute;e disponible dans letableau",
                    "oPaginate": {
                        "sFirst": "Premier",
                        "sPrevious": "Pr&eacute;c&eacute;dent",
                        "sNext": "Suivant",
                        "sLast": "Dernier"
                    },
                    "oAria": {
                        "sSortAscending": "activer pour trier la colonne par ordre croissant",
                        "sSortDescending": "activer pour trier la colonne par ordre d&eacute;croissant"
                    }
                },
                columns: [{
                        title: "Nom agent"
                    },
                    {
                        title: "client"
                    },
                    {
                        title: "Date Paiement"
                    },
                    {
                        title: "Reçu"
                    },
                    {
                        title: "Montant"
                    },
                ]
            });
        }
    });

    Meteor.call('SumPaiementParClient', $('#input-search').val(), (error, result2) => {
        if (error) {
            console.log(error);
        } else {
            if (result2.length > 0) {
                Session.set('result2', result2);
                let res2 = Session.get('result2');
                ////console.log(JSON.stringify(result));
                let element = '<div style="height: 70px;line-height: 70px;text-align: center;border: 1px dashed #f69c55;">';
                let scp = (monthDiff(res2[0]._id.date_mise_service, new Date()) * 30) + 30;
                let msp = monthDiff(res2[0]._id.date_mise_service, new Date()) + 1;
                let sp = res2[0].total ? res2[0].total : 0;
                let mp = Math.floor(sp / 30);
                let sa = Math.abs(scp - sp);
                let mpa = Math.abs(Math.floor(sa / 30));
                element += '<span>&nbsp;&nbsp;&nbsp;SOMME TOTAL PAYER (' + mp + ' mois):<b>&nbsp;' + sp + 'DH</b></span>';
                element += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>SOMME CENSE PAYER (' + msp + ' mois)<b>:&nbsp;' + scp + 'DH</b></span>';
                element += sp > scp ? '<span style="color:green;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SOMME PAYE AVANCE (' + mpa + ' mois) <b>:&nbsp;' + sa + 'DH </b></span>' : '<span style="color:red;">&nbsp;&nbsp;&nbsp;<b>SOMME RETARD (' + mpa + ' mois):&nbsp; ' + sa + 'DH</b></span>';
                element += '</div>'
                $('#les-montants').html(element);

            }
        }

    });

}