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

  import '/imports/ui/pages/adminTo/paiements/listPaiements.js';

}

let TabularTablesPaiements = {};
Meteor.isClient && Template.registerHelper('TabularTablesPaiements', TabularTablesPaiements);

TabularTablesPaiements.Paiements = new Tabular.Table({
  name: "Paiements",
  collection: Paiements,
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
  "lengthMenu": [
    [10, 30, 100, 1000],
    [10, 30, 100, 1000]
  ],
  "scrollX": true,
  "scrollY": "300px",
  "order": [
    [11, "desc"]
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
        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }
    },
    {
      extend: "pdfHtml5",
      title: "les_paiements",
      exportOptions: {
        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }
    },
    {
      extend: "csvHtml5",
      title: "les_paiements",
      exportOptions: {
        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }
    },
    {
      extend: "print",
      text: "imprimer",
      exportOptions: {
        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
      "targets": [11],
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
      data: "client.date_mise_service",
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
      data: "date_paiement_manuelle",
      title: "Date Paiement",
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

  Template.listPaiements.onRendered(function () {
    Session.set("filtre", '');
    $('#date-debut').datepicker({
      format: 'dd-mm-yyyy',
    });
    $('#date-fin').datepicker({
      format: 'dd-mm-yyyy',
    });

    $('#date-mise-service').datepicker({
      format: 'dd-mm-yyyy',
    });

    Meteor.call('listeProvinces', (error, results) => {
      let content = '';
      if (error) {
        //console.log(error);
      } else {
        //console.log('first province ' + results[0]);
        Session.set('FirstProvince', results[0]);
      }
    });

  });


  Template.listPaiements.events({

    "click  #clear-search-paiement": function (event, template) {
      $('#date-debut').val('')
      $('#date-fin').val('');
      $('#date-mise-service').val('');
      $('#cin-client').val('');
      $('#province').val('');
      Session.set('FirstProvince', '');
      Session.set("filtre", '');

    },

    "submit  #form-search-paiement": function (event, template) {
      event.preventDefault();

      let cin = $("#cin-client").val();
      //console.log('cin client ' +cin);

      let date_mise_service;
      if ($('#date-mise-service').val()) {
        date_mise_service = $('#date-mise-service').val();
      }
      let province = $('#province').val();

      let dateDebut;
      if ($('#date-debut').val()) {
        let dtDebutIterm = $('#date-debut').val();
        let tabDebut = dtDebutIterm.split("-");
        dateDebut = new Date(tabDebut[2], tabDebut[1] - 1, tabDebut[0], 00, 00, 00);

      }

      let dateFin;
      if ($('#date-fin').val()) {
        let dtFinIterm = $('#date-fin').val();
        let tabFin = dtFinIterm.split("-");
        dateFin = new Date(tabFin[2], tabFin[1] - 1, tabFin[0], 23, 00, 00);
        //console.log('date fin ' + dateFin);
      }

      if ((date_mise_service != '' && date_mise_service != undefined) ||
        (cin != '' && cin != undefined) || (province != '' && province != undefined) ||
        (dateDebut != '' && dateDebut != undefined) || (dateFin != '' && dateFin != undefined)) {

        let filtre = {
          date_mise_service: date_mise_service,
          cin: cin,
          province: province,
          dateDebut: dateDebut,
          dateFin: dateFin
        };
        //console.log('filtre exsite -' + JSON.stringify(filtre));
        Session.set("filtre", filtre);

      }

    }
  });


  Template.listPaiements.helpers({
    provinces: function () {

      Meteor.call('listeProvinces', (error, results) => {
        let content = '';
        if (error) {
          //console.log(error);
        } else {
          content = '<select id="province" class="form-control select2">';
          content += '';

          for (var i = 0; i < results.length; i++) {
            content += '<option value="' + results[i] + '">' + results[i] + '</option>';
          }
          content += '</select>';
          $('.select-province').html(content);
        }
      });
    },

    selector() {
      let filtre = Session.get('filtre') ? Session.get('filtre') : '';

      if (filtre) {
        let query = {
          $and: []
        };
        //console.log('filtre exsite -' + JSON.stringify(filtre));
        let date_mise_service_debut;
        if (filtre.date_mise_service != '' && filtre.date_mise_service != undefined) {
          let tabMiseService = filtre.date_mise_service.split("-");
          let date_mise_service_debut = new Date(tabMiseService[2], tabMiseService[1] - 1, tabMiseService[0], 00, 00, 00);
          let date_mise_service_fin = new Date(tabMiseService[2], tabMiseService[1] - 1, tabMiseService[0], 23, 00, 00);
          //console.log('filtre exsite ici  -' + date_mise_service_debut);
          query.$and.push({
            "client.date_mise_service": {
              '$gte': date_mise_service_debut,
              '$lt': date_mise_service_fin
            }
          });
        }

        if (filtre.cin != '' && filtre.cin != undefined) {
          query.$and.push({
            'client.cin': {
              '$regex': filtre.cin,
              '$options': 'i'
            }
          });
        }

        if (filtre.province != '' && filtre.province != undefined) {
          query.$and.push({
            'client.province': {
              '$regex': filtre.province,
              '$options': 'i'
            }
          });
        }

        if (filtre.dateDebut != '' && filtre.dateDebut != undefined && filtre.dateFin != '' && filtre.dateFin != undefined) {
          query.$and.push({
            date_paiement_manuelle: {
              '$gt': filtre.dateDebut,
              '$lt': filtre.dateFin
            }
          });
        }
        //console.log('query -' + JSON.stringify(query));
        return query;
      } else if (Session.get('FirstProvince')) {
        //console.log('filtre par default province' + JSON.stringify(Session.get('filtre')));

        return {
          'client.province': Session.get('FirstProvince')
        };
      } else {
        return {};
      }
    },
  });

  Template.listPaiements.onCreated(function () {

    Meteor.subscribe("paiementsById", Session.get('PaiementID'));

  });

}