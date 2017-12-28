import {
    Meteor
  } from 'meteor/meteor';
  import 'meteor/kevohagan:sweetalert';
  import './updatedatepaiements.html';
  
  Template.updatedatepaiements.onCreated(() => {
    Template.instance().uploading = new ReactiveVar(false);
  });
  
  Template.updatedatepaiements.helpers({
    uploading() {
      return Template.instance().uploading.get();
    }
  });
  
  Template.updatedatepaiements.events({
    'change [name="uploadCSV"]' (event, template) {
      template.uploading.set(true);
  
      Papa.parse(event.target.files[0], {
        header: true,
        complete(results, file) {
          Meteor.call('parseUpdatePaiements', results.data, (error, response) => {
            console.log("j'ai fini la conversion deu fichier en json");
            if (error) {
              console.log(error);
              template.uploading.set(false);
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
                title: 'Mise à jour des dates complete complete',
                text: 'Paiemesnts Totaux :' + response,
                showConfirmButton: false,
              })
            }
          });
        }
      });
    }
  });