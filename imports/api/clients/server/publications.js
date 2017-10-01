import { Meteor } from 'meteor/meteor';
import 'meteor/meteorhacks:aggregate';
import 'meteor/check';
import 'meteor/meteorhacks:aggregate';
import 'meteor/reywood:publish-composite';
import 'meteor/meteorhacks:unblock';
import 'meteor/jcbernack:reactive-aggregate';
import { Paiements } from '/imports/api/paiements/paiements.js';
import { Clients } from '../clients.js';


Meteor.publish('clients', function () {
  return Clients.find({}, {
    nom: 1,
    prenom: 1,
    cin: 1,
    province: 1,
    commune: 1,
    village: 1,
    'contrat.ref_contrat': 1,
    'contrat.date_mise_service': 1
  });
});


Meteor.publishComposite("tabular_Clients", function (tableName, ids, fields) {
  check(tableName, String);
  check(ids, Array);
  check(fields, Match.Optional(Object));

  this.unblock(); // requires meteorhacks:unblock package

  return {
    find: function () {
      this.unblock(); // requires meteorhacks:unblock package

      return Clients.find({ _id: { $in: ids } }, { fields: fields });
    },
    children: [
      {
        find: function (client) {
          this.unblock(); // requires meteorhacks:unblock package
          // Publish the related user
          return Paiements.find({ 'client.cin': client.cin }, { 'client.ref_contrat': 1, 'client.ref_contrat': 1, data_paiement_manuelle: 1, montant: 1 });
        }
      }
    ]
  };
});

Meteor.publish('insertClient', function (client) {
  Clients.insert(client);
});




