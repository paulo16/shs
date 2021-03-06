import {
  Meteor
} from 'meteor/meteor';
import './uploadClients.html';

Template.uploadClients.onCreated(() => {
  Template.instance().uploading = new ReactiveVar(false);
});

Template.uploadClients.helpers({
  uploading() {
    return Template.instance().uploading.get();
  }
});

Template.uploadClients.events({
  'change [name="uploadCSV"]' (event, template) {
    template.uploading.set(true);

    Papa.parse(event.target.files[0], {
      header: true,
      complete(results, file) {
        Meteor.call('parseUploadClient', results.data, (error, response) => {
          console.log("j'ai fini la conversion deu fichier en json");
          if (error) {
            console.log(error);
            template.uploading.set(false);
            Meteor.call('removeClients', (error1, result) => {
              if (result) {
                swal(
                  'Oops...',
                  'Problème au niveau des données, verifiez vos données les dates particulièrement !',
                  'error'
                );
              } else if (error1) {
                console.log(error1);
              }
            });
          } else if (response) {
            console.log('parseUpload complete .');
            template.uploading.set(false);
            Bert.alert('Upload complete!', 'success', 'growl-top-right');
          }
        });
      }
    });
  }
});