import {
    Meteor
} from 'meteor/meteor';

import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';

import {
    Template
} from 'meteor/templating';
import moment from 'moment';
import Tabular from 'meteor/aldeed:tabular';
import {
    Clients
} from '/imports/api/clients/clients.js';

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

    import '/imports/ui/pages/adminTo/clients/listClients.js';
}

let TabularTablesClients = {};
Meteor.isClient && Template.registerHelper('TabularTablesClients', TabularTablesClients);

TabularTablesClients.Clients = new Tabular.Table({
    name: "Clients",
    collection: Clients,
    responsive: true,
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
    "scrollY": "300px",
    dom: 'lBfrtip',
    "buttons": [{
            extend: 'colvis',
            text: "cols visibles",

        },
        {
            extend: "excelHtml5",
            title: "les_clients",
            exportOptions: {
                columns: [0, 1, 2, 3]
            }
        },
        {
            extend: "pdfHtml5",
            title: "les_clients",
            exportOptions: {
                columns: [0, 1, 2, 3]
            }
        },
        {
            extend: "csvHtml5",
            title: "les_clients",
            exportOptions: {
                columns: [0, 1, 2, 3]
            }
        },
        {
            extend: "print",
            text: "imprimer",
            exportOptions: {
                columns: [0, 1, 2, 3]
            }
        },
    ],
    "columnDefs": [{
            "targets": [5],
            "visible": false,
        },
        {
            "targets": [6],
            "visible": false
        },
        {
            "targets": [8],
            "visible": false
        },
    ],
    columns: [{
            data: 'nom',
            title: 'Nom',
            render: function (val, type, doc) {
                let queryparams = {
                    id: doc._id,
                    ref_contrat: doc.contrat.ref_contrat
                };
                //var queryParams = {show: "yes", color: "black"};

                let path = FlowRouter.path("profile", '', queryparams);
                //console.log(path);
                return '<a href=' + path + '>' + val + '</a>';
            }
        },
        {
            data: 'prenom',
            title: 'Prenom',
            render: function (val, type, doc) {
                let queryparams = {
                    id: doc._id,
                    ref_contrat: doc.contrat.ref_contrat
                };
                //var queryParams = {show: "yes", color: "black"};

                let path = FlowRouter.path("profile", '', queryparams);
                //console.log(path);
                return '<a href=' + path + '>' + val + '</a>';
            }
        },
        {
            data: 'cin',
            title: 'Cin',
            render: function (val, type, doc) {
                let queryparams = {
                    id: doc._id,
                    ref_contrat: doc.contrat.ref_contrat
                };
                //var queryParams = {show: "yes", color: "black"};

                let path = FlowRouter.path("profile", '', queryparams);
                //console.log(path);
                return '<a href=' + path + '>' + val + '</a>';
            }
        },
        {
            data: 'province',
            title: 'Province'
        },
        {
            data: 'commune',
            title: 'Commune'
        },
        {
            data: 'village',
            title: 'Village'
        },
        {
            data: 'contrat.ref_contrat',
            title: 'Contrat',
            render: function (val, type, doc) {
                let queryparams = {
                    id: doc._id,
                    ref_contrat: doc.contrat.ref_contrat
                };
                //var queryParams = {show: "yes", color: "black"};

                let path = FlowRouter.path("profile", '', queryparams);
                //console.log(path);
                return '<a href=' + path + '>' + val + '</a>';
            }
        },
        {
            data: "contrat.date_mise_service",
            title: "Date M.Service",
            render: function (val, type, doc) {
                if (val instanceof Date) {
                    return moment(val).format("DD-MM-YYYY HH:mm");
                } else {
                    return "Aucune";
                }
            }
        },
        {
            title: "Actions",
            tmpl: Meteor.isClient && Template.ClientsActionBtns,
            class: "col-md-2"
        }
    ]
});