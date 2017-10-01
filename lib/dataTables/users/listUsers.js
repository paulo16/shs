import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import moment from 'moment';
import Tabular from 'meteor/aldeed:tabular';
import { Users } from '/imports/api/users/users.js';

import { $ } from 'meteor/jquery';

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

  import '/imports/ui/pages/adminTo/users/listUsers.js';
}

let TabularTablesUsers = {};
Meteor.isClient && Template.registerHelper('TabularTablesUsers', TabularTablesUsers);

TabularTablesUsers.Users = new Tabular.Table({
  name: "Users",
  collection: Meteor.users,
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
  "buttons": [
    {
      extend: 'colvis',
      text: "cols visibles",

    },
    {
      extend: "excelHtml5",
      title: "les_users",
      exportOptions: {
        columns: [0, 1, 2, 3]
      }
    },
    {
      extend: "pdfHtml5",
      title: "les_users",
      exportOptions: {
        columns: [0, 1, 2, 3]
      }
    },
    {
      extend: "csvHtml5",
      title: "les_users",
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
    },],
  columns: [
    { data: 'profile.lastName', title: 'Nom' },
    { data: 'profile.firstName', title: 'Prénom' },
    { data: "profile.numero_agent", title: "Numero" },
    { data: "roles.0", title: "Role" },
    { data: "username", title: "Pseudo" },
    { data: 'emails.0.address', title: 'Email' },
    {
      title: "Actions",
      tmpl: Meteor.isClient && Template.UsersActionBtns, class: "col-md-2"
    }
  ]
});


