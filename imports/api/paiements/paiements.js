import SimpleSchema from 'simpl-schema';

export const Paiements = new Mongo.Collection('paiements');


let virementSchema = new SimpleSchema({
    numero_virement: {
        type: String,
        optional: true
    },
    banque: {
        type: String,
        optional: true
    }
});

let agentSchema = new SimpleSchema({
    numero_agent: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    }
});


let clientSchema = new SimpleSchema({
    ref_contrat: {
        type: String,
        optional: true
    },
    nom: {
        type: String,
        optional: true
    },
    cin: {
        type: String,
        optional: true
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
    date_mise_service: {
        type: Date,
        optional: true
    }
});

let paiementsSchema = new SimpleSchema({

    agent: {
        type: agentSchema,
        optional: true
    },
    client: {
        type: clientSchema,
    },

    montant: {
        type: Number,
    },

    recu_pdf: {
        type: String,
        optional: true
    },

    date_paiement_auto: {
        type: Date,
        optional: true

    },
    date_paiement_manuelle: {
        type: Date,
        optional: true,
    },

    type_paiement: {
        type: String,
        optional: true,
    },

    emeteur_paiement_cin: {
        type: String,
        optional: true,
    },

    virement: {
        type: virementSchema,
        optional: true,
    },

});

Paiements.attachSchema(paiementsSchema);