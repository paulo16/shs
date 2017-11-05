import {
    Meteor
} from 'meteor/meteor';
import {
    Session
} from 'meteor/session';
import {
    Template
} from 'meteor/templating';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import './profile.html';
import {
    Clients
} from '/imports/api/clients/clients.js';

import {
    Paiements
} from '/imports/api/paiements/paiements.js';


Template.compoprofile.onCreated(function () {
    let currentUrl = FlowRouter.current();
    let idclient = currentUrl.queryParams.id;
    let contrat = currentUrl.queryParams.ref_contrat;

    console.log(contrat);
    //Session.set('info', {});
    Meteor.call('findClientById', idclient, (error, result) => {
        if (error) {
            console.log('erreur' + error);

        } else if (result) {
            console.log('le resultat' + JSON.stringify(result));
            Session.set('info', result);
        }

    });

    Meteor.call('findHistorique', contrat, (error, result) => {
        if (error) {
            console.log('erreur' + error);

        } else if (result) {
            //console.log('les paiements' + JSON.stringify(result));
            Session.set('paiements', result);
        }

    });

});

Template.compoprofile.helpers({
    info() {

        let info = Session.get('info');
        if (info) {
            return info;
        }
        return {};
    },
});

Template.compoprofile.onRendered(function () {
    let currentUrl = FlowRouter.current();
    let idclient = currentUrl.queryParams.id;
    let contrat = currentUrl.queryParams.ref_contrat;

    let paiements = Session.get('paiements');
    //console.log('onredered'+JSON.stringify(paiements));
    let dataset = [];
    if (paiements) {
        let contenu;
        let lien;
        paiements.forEach(function (element) {

            if (element.recu_pdf) {
                lien = element.recu_pdf.replace(/.*pdfs\\/, "");
            }
            if (!element.type_paiement) {
                element.type_paiement = "non-defini";

            }
            contenu = [
                element.client.cin,
                moment(element.date_paiement_auto).format("DD-MM-YYYY HH:mm"),
                lien,
                element.type_paiement,
                element.montant
            ];
            dataset.push(contenu);
        })
    }
    $("#table-historique").dataTable({
        data: dataset,
        destroy: true,
        pageLength: 3,
        lengthMenu: [
            [3, 10, 20, -1],
            [3, 10, 20, "tous"]
        ],
        // dom: '<tip>',
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
        }
    });

    Meteor.call('SumPaiementParClient', contrat, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            if (result.length > 0) {
                Session.set('result2', result);
                let res2 = Session.get('result2');
                console.log(JSON.stringify('les sommes ' + result));
                let element = '<div style="height: 70px;line-height: 70px;text-align: center;border: 1px dashed #f69c55;">';
                let scp = monthDiff(res2[0]._id.date_mise_service, new Date()) * 30;
                let msp = monthDiff(res2[0]._id.date_mise_service, new Date());
                let sp = res2[0].total ? res2[0].total : 0;
                let mp = Math.floor(sp / 30);
                let sa = Math.abs(scp - sp);
                let mpa = Math.abs(Math.floor(sa / 30));
                element += '<span>&nbsp;TOTAL PAYER (' + mp + ' mois):<b>&nbsp;' + sp + 'DH</b></span>';
                element += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>CENSE PAYER (' + msp + ' mois)<b>:&nbsp;' + scp + 'DH</b></span>';
                element += sp > scp ? '<span style="color:green;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AVANCE (' + mpa + ' mois) <b>:&nbsp;' + sa + 'DH </b></span>' : '<span style="color:red;">&nbsp;&nbsp;&nbsp;<b> RETARD (' + mpa + ' mois):&nbsp; ' + sa + 'DH</b></span>';
                element += '</div>'
                $('#les-montants').html(element);

            }
        }

    });

});

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}