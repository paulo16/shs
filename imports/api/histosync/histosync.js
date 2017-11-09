import SimpleSchema from 'simpl-schema';

export const HistoSync = new Mongo.Collection('histosync');

let HistoSyncSchema = new SimpleSchema({

    date_debut_synchro: {
        type: Date,
    },
    nom_collection: {
        type: String,
    },
    recu_pdf: {
        type: String,
    },
    numero_agent: {
        type: String,
    },
});

HistoSync.attachSchema(HistoSyncSchema);