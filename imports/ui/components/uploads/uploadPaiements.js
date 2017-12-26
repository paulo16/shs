import {
  Meteor
} from 'meteor/meteor';
import 'meteor/kevohagan:sweetalert';
import './uploadPaiements.html';

Template.uploadPaiements.onCreated(() => {
  Template.instance().uploading = new ReactiveVar(false);
});

Template.uploadPaiements.helpers({
  uploading() {
    return Template.instance().uploading.get();
  }
});

Template.uploadPaiements.events({
  'change [name="uploadCSV"]' (event, template) {
    template.uploading.set(true);

    Papa.parse(event.target.files[0], {
      header: true,
      complete(results, file) {
        Meteor.call('parseUploadPaiements', results.data, (error, response) => {
          console.log("j'ai fini la conversion deu fichier en json");
          if (error) {
            console.log(error);
            template.uploading.set(false);
            /*
            Meteor.call('removePaiements', (error1, result) => {
              if (result) {
                swal(
                  'Oops...',
                  'Problème au niveau des données, verifiez vos données les dates particulièrement !',
                  'error'
                );
              } else if (error1) {
                console.log(error1);
              }
            });*/
            swal(
              'Oops...',
              'Problème au niveau des données, verifiez vos données les dates particulièrement !',
              'error'
            );
          } else if (response) {
            console.log('parseUpload complete .');
            template.uploading.set(false);
            swal({
              position: 'top-right',
              type: 'success',
              title: 'Importation complete',
              text: 'Paiemesnts Totaux :' + response,
              showConfirmButton: false,
            })
          }
        });
      }
    });
  }
});