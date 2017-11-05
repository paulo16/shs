import {
  Meteor
} from 'meteor/meteor';
import 'meteor/meteorhacks:aggregate';
import 'meteor/reywood:publish-composite';
import 'meteor/meteorhacks:unblock';
import 'meteor/jcbernack:reactive-aggregate';
import {
  Paiements
} from '../paiements.js';

Meteor.publish('paiements', function () {
  return Paiements.find({});
});

Meteor.publish('paiementById', function (id) {

  return Paiements.find({
    _id: id
  });

});

Meteor.publish('paiementByCin', function (cin) {

  return Paiements.find({
    'client.cin': cin
  });

});

Meteor.publish('paiementBySaisi', function (varsaisi) {

  return Paiements.find({
    $or: [{
        'client.cin': varsaisi
      },
      {
        'client.nom': varsaisi
      },
      {
        'client.prenom': varsaisi
      },
      {
        'contrat.ref_contrat': varsaisi
      }
    ]
  });

});