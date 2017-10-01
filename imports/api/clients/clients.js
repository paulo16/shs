import SimpleSchema from 'simpl-schema';

export const Clients = new Meteor.Collection('clients');

let contratSchema = new SimpleSchema({
  ref_contrat: {
    type: String,
    optional: true
  },
  date_mise_service: {
    type: Date,
    optional: true
  }
});

let ClientSchema = new SimpleSchema({

  nom: {
    type: String,
  },

  prenom: {
    type: String,
    optional: true
  },

  cin: {
    type: String,
    optional: true

  },

  sexe: {
    type: String,
    optional: true,
  },

  civilite: {
    type: String,
    optional: true,
  },

  province: {
    type: String,
    optional: true
  },

  commune: {
    type: String,
    optional: true
  },

  village: {
    type: String,
    optional: true
  },

  contrat: {
    type: contratSchema,
    optional: true
  },

});

Clients.attachSchema(ClientSchema);


