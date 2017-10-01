import { Meteor } from 'meteor/meteor';
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
  'change [name="uploadCSV"]'(event, template) {
    template.uploading.set(true);

    Papa.parse(event.target.files[0], {
      header: true,
      complete(results, file) {
        Meteor.call('parseUploadPaiements', results.data, (error, response) => {
          console.log("j'ai fini la conversion deu fichier en json");
          if (error) {
            console.log(error);
            template.uploading.set(false);
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