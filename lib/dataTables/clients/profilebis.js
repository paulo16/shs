import {
    Meteor
} from 'meteor/meteor';
import {
    Session
} from 'meteor/session'
import {
    Template
} from 'meteor/templating';
import moment from 'moment';
import Tabular from 'meteor/aldeed:tabular';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
import {
    Paiements
} from '/imports/api/paiements/paiements.js';

import {
    $
} from 'meteor/jquery';

// Bootstrap Theme
import dataTablesBootstrap from 'datatables.net-bs';
//import 'datatables.net-bs/css/dataTables.bootstrap.css';
// Buttons Core
import dataTableButtons from 'datatables.net-buttons-bs';

// Import whichever buttons you are using
import columnVisibilityButton from 'datatables.net-buttons/js/buttons.colVis.js';
import html5ExportButtons from 'datatables.net-buttons/js/buttons.html5.js';
import flashExportButtons from 'datatables.net-buttons/js/buttons.flash.js';
import printButton from 'datatables.net-buttons/js/buttons.print.js';


// Then initialize everything you imported
if (Meteor.isClient) {

    dataTablesBootstrap(window, $);
    dataTableButtons(window, $);
    columnVisibilityButton(window, $);
    html5ExportButtons(window, $);
    flashExportButtons(window, $);
    printButton(window, $);

    import '/imports/ui/pages/adminTo/clients/profilebis.js';

}

let TabularTablesPaiementsclient = {};
Meteor.isClient && Template.registerHelper('TabularTablesPaiementsclient', TabularTablesPaiementsclient);

TabularTablesPaiementsclient.Paiements = new Tabular.Table({
    name: "Paiements",
    collection: Paiements,
    responsive: true,
    pageLength: 5,
    lengthMenu: [
        [5, 10, 50, -1],
        [5, 10, 50, "tous"]
    ],
    autoWidth: false,
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
    "scrollX": true,
    "order": [
        [10, "desc"]
    ],
    buttonContainer: '.col-sm-6:eq(0)',
    "buttons": [{
            extend: 'colvis',
            text: "cols visibles",

        },
        {
            extend: "excelHtml5",
            title: "les_paiements",
            exportOptions: {
                columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        },
        {
            extend: "pdfHtml5",
            title: "les_paiements",
            exportOptions: {
                columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        },
        {
            extend: "csvHtml5",
            title: "les_paiements",
            exportOptions: {
                columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        },
        {
            extend: "print",
            text: "imprimer",
            exportOptions: {
                columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        },
    ],
    "columnDefs": [{
            "targets": [2],
            "visible": false,
        },
        {
            "targets": [5],
            "visible": false
        },
        {
            "targets": [6],
            "visible": false
        },
        {
            "targets": [7],
            "visible": false
        },
        {
            "targets": [10],
            "visible": false
        }
    ],
    columns: [{
            data: "agent.lastName",
            title: "Nom agent"
        },
        {
            data: "agent.numero_agent",
            title: "No agent"
        },
        {
            data: "client.ref_contrat",
            title: "ref contrat"
        },
        {
            data: "client.nom",
            title: "Nom"
        },
        {
            data: "client.cin",
            title: "Cin"
        },
        {
            data: "client.province",
            title: "Province"
        },
        {
            data: "client.commune",
            title: "commune"
        },
        {
            data: "client.village",
            title: "village"
        },
        {
            data: "date_paiement_auto",
            title: "Date Automatioque",
            render: function (val, type, doc) {
                if (val instanceof Date) {
                    return moment(val).format("DD-MM-YYYY HH:mm");
                } else {
                    return "Aucune";
                }
            }
        },
        {
            data: "date_paiement_manuelle",
            title: "Date Manuelle",
            render: function (val, type, doc) {
                if (val instanceof Date) {
                    return moment(val).format("DD-MM-YYYY HH:mm");
                } else {
                    return "Aucune";
                }
            }
        },
        {
            data: "montant",
            title: "Montant"
        },
        {
            title: "Actions",
            tmpl: Meteor.isClient && Template.PaiementsActionBtns,
            class: "col-md-2"
        },
    ],

});

if (Meteor.isClient) {

    Template.profilebis.onRendered(function () {
        let currentUrl = FlowRouter.current();
        let idclient = currentUrl.queryParams.id;
        let contrat = currentUrl.queryParams.ref_contrat;
        let cin = currentUrl.queryParams.cin;
        let filtre = {
            contrat: contrat,
            cin: cin
        };
        Session.set("filtre", filtre);
    });



    Template.profilebis.helpers({

        selector() {
            let filtre = Session.get('filtre') ? Session.get('filtre') : '';
            if (filtre) {
                let query = {
                    $or: []
                };
                if (filtre.cin) {
                    query.$or.push({
                        'client.cin': filtre.cin
                    });
                }
                if (filtre.contrat) {
                    query.$or.push({
                        'client.ref_contrat': filtre.contrat
                    })
                }
                //console.log('query -' + JSON.stringify(query));
                return query;
            }

            return {};
        },
    });

    Template.profilebis.onCreated(function () {

        Meteor.subscribe("paiementsById", Session.get('PaiementID'));

    });

}