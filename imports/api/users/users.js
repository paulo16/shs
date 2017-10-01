
import SimpleSchema from 'simpl-schema';

SimpleSchema.extendOptions(['autoform']);


// Schéma du profil
let schemas = {};

schemas.UserProfile = new SimpleSchema({

    firstName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,50}/,
        optional: true,
        label: "Prénom"
    },

    lastName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,50}/,
        optional: true,
        label: "Nom"
    },

    birthDay: {
        type: Date,
        optional: true,
        label: "Date de naissance"
    },

    phone: {
        type: String,
        optional: true,
        label: "Telephone"
    },

    photo: {
        type: String,
        optional: true,
        label: "Photo"
    },

    numero_agent: {
        type: String,
        optional: true
    },

});


// Schéma principal

schemas.User = new SimpleSchema({

    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        label: "Nom d'utilisateur"
    },

    password: {
        type: String,
        label: "Mot de passe",
        optional: true,
        autoform: {

            afFieldInput: {

                type: "password"
            }
        }
    },

   
    emails: {
        type: Array,
        optional: true,
        label: "Adresses Email"
    },
    'emails.$': { type: Object, optional: true },

    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        label: "Adresse"
    },

    "emails.$.verified": {
        type: Boolean,
        optional: true,
        autoform: {
            omit: true
        }
    },

    createdAt: {
        type: Date,
        autoValue: function () {

            if (this.isInsert) {
                return new Date;
            }
        },

        autoform: {
            omit: true
        }

    },

    profile: {
        type: schemas.UserProfile,
        optional: true,
    },

    services: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    },
    // you can specify [String] as the type
    roles: {
        type: Array,
        optional: true
    },
    'roles.$': {
        type: String
    },

});


// On attache ce schéma à la collection

Meteor.users.attachSchema(schemas.User);
