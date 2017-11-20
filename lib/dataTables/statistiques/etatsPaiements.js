import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'
import { Template } from 'meteor/templating';
import moment from 'moment';
import Tabular from 'meteor/aldeed:tabular';
import { Clients } from '/imports/api/clients/clients.js';
import { Paiements } from '/imports/api/paiements/paiements.js';
import 'meteor/dburles:collection-helpers';

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

  import '/imports/ui/pages/adminTo/statistiques/etatsPaiements.js';


}


let TabularTablesEtatsPaiements = {};
Meteor.isClient && Template.registerHelper('TabularTablesEtatsPaiements', TabularTablesEtatsPaiements);

TabularTablesEtatsPaiements.EtatsPaiements = new Tabular.Table({
  name: "EtatsPaiements",
  collection: Clients,
  pub: "tabular_Clients",
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
    },],
  "columnDefs": [
    {
      "targets": [1],
      "visible": false,
    },
    {
      "targets": [4],
      "visible": false,
    },
    {
      "targets": [5],
      "visible": false,
    },
    {
      "targets": [6],
      "visible": false
    },
  ],
  columns: [
    { data: 'nom', title: 'Nom' },
    { data: 'prenom', title: 'Prenom' },
    { data: 'cin', title: 'Cin' },
    { data: 'province', title: 'Province' },
    { data: 'commune', title: 'Commune' },
    { data: 'village', title: 'Village' },
    { data: 'contrat.ref_contrat', title: 'Contrat' },
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
    { data: "montantPaye()", title: "Mt Payé" },
    { data: "montantCp()", title: "Mt Censé Payer" },
    { data: "montantPav()", title: "Mt Payé en Av" }
  ]
});

if (Meteor.isClient) {

  Template.etatsPaiements.onRendered(function () {

    $('select2').select2();

    Meteor.call('findMinDatePaiement', (error, result) => {
      if (error) {
        console.log(error);
      } else {
        //console.log('mindate: ' + JSON.stringify(result[0].mindate));
        Session.set('minDate', result[0].mindate);
      }

    });

    Session.set("filtre", '');
    console.log('date-debut ' + Session.get('minDate'));

    $('#date-debut').datetimepicker({
      timepicker: false,
      format: 'DD-MM-YYYY',
    });

    $('#date-fin').datetimepicker({
      timepicker: false,
      format: 'DD-MM-YYYY',
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


  Template.etatsPaiements.events({

    //on vide tous les filtres ,surtout les sessions 
    "click  #clear-search-paiement": function (event, template) {
      $('#date-mise-service').val('');
      $('#date-debut').val('');
      $('#date-fin').val('');
      $('#cin').val('');
      $('#province').val('');
      Session.set("filtre", '');
      Session.set('where_date_paiement', '');


    },

    "submit  #form-search-paiement": function (event, template) {
      event.preventDefault();

      let cin = $('#cin').val();
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

      if ((cin != '' && cin != undefined) || (province != '' && province != undefined)
        || (dateDebut != '' && dateDebut != undefined) || (dateFin != '' && dateFin != undefined)) {

        let filtre = {
          cin: cin,
          province: province,
          dateDebut: dateDebut,
          dateFin: dateFin
        };
        Session.set("filtre", filtre);

      }

    }
  });


  Template.etatsPaiements.helpers({

    provinces: function () {

      Meteor.call('listeProvinces', (error, results) => {
        let content = '';
        if (error) {
          console.log(error);
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
    dateDebut: function () {
      return moment(Session.get('minDate')).format("DD-MM-YYYY");

    },
    dateFin: function () {
      return moment(new Date()).format("DD-MM-YYYY");

    },

    selector() {
      let filtre = Session.get('filtre') ? Session.get('filtre') : '';

      if (filtre != '' && filtre != undefined) {
        let query = { $and: [] };

        if (filtre.cin != '' && filtre.cin != undefined) {
          query.$and.push({ cin: { '$regex': filtre.cin, '$options': 'i' } });
        }

        if (filtre.province != '' && filtre.province != undefined) {
          query.$and.push({ province: { '$regex': filtre.province, '$options': 'i' } });
        }

        if (filtre.dateDebut != '' && filtre.dateDebut != undefined && filtre.dateFin != '' && filtre.dateFin != undefined) {
          //Meteor.subscribe('paiementParClient', filtre.dateDebut, filtre.dateFin);
          let where = { datedebut: filtre.dateDebut, datefin: filtre.dateFin };
          Session.set('where_date_paiement', where);
          //query.$and.push({ date_mise_service: { '$gt': filtre.dateDebut, '$lt': filtre.dateFin } });
        }
        //console.log('query -' + JSON.stringify(query));
        return query;
      }
      //console.log('filtre par default province' + Session.get('FirstProvince'));

      return { province: Session.get('FirstProvince') };
    },
  });


  Template.etatsPaiements.onCreated(function () {
    /*
    if (Session.get('filtre')) {
      let where_filtre = { dateDebut: Session.get('minDate'), dateFin: new Date() };
      Session.set('filtre', where_filtre);
    }
   */

  });

  // les fonctions ci-dessous utilisent le package dburles:collection-helpers
  //il permet d"etendre une collection en rajoutant de nouveau champs à celle-ci ,
  //Ainsi je peut maintenant faire Clients.find().montantCp() ,
  Clients.helpers({

    montantPaye: function () {
      let somme = 0;
      let datep = Session.get('where_date_paiement');
      let p;

      if (this.contrat.ref_contrat) {
        if (datep) {
          p = Paiements.find({ date_paiement_manuelle: { $gte: datep.datedebut, $lt: datep.datefin }, 'client.ref_contrat': this.contrat.ref_contrat }).fetch();

        } else {
          p = Paiements.find({ 'client.ref_contrat': this.contrat.ref_contrat }).fetch();
        }

        p.forEach(function (element) {
          somme += element.montant;
        });
        return somme;

      }
      return 0;
    },
    montantCp: function () {
      let mois;
      let datep = Session.get('where_date_paiement');
      if (datep) {
        mois = monthDiff(this.contrat.date_mise_service, datep.datefin);
      } else {
        mois = monthDiff(this.contrat.date_mise_service, new Date());
      }
      return mois * 30;
    },
    montantPav: function () {
      let somme = 0;
      let datep = Session.get('where_date_paiement');
      let datefin = new Date();
      let p;

      if (this.contrat.ref_contrat) {
        if (datep) {
          p = Paiements.find({ date_paiement_manuelle: { $gte: datep.datedebut, $lt: datep.datefin }, 'client.ref_contrat': this.contrat.ref_contrat }).fetch();
          datefin = datep.datefin;
        } else {
          p = Paiements.find({ 'client.ref_contrat': this.contrat.ref_contrat }).fetch();
        }

        p.forEach(function (element) {
          somme += element.montant;
        });
      }
      let mp = somme;
      let mois = monthDiff(this.contrat.date_mise_service, datefin);
      let mcp = mois * 30;
      let mpav = mp - mcp;

      if (mpav < 0) return '<span style="color:red">' + mpav + '</span>';
      return '<span style="color:green">' + mpav + '</span>';

    },
  })

}

// function d'aide calcul difference de mois entre 2 dates
function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth() + 1;
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

