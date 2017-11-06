import {
    Meteor
} from 'meteor/meteor';
import 'meteor/meteorhacks:aggregate';
import {
    Paiements
} from '/imports/api/paiements/paiements.js';
import {
    HistoSync
} from './histosync.js';

import {
    HTTP
} from 'meteor/http';


Meteor.methods({

    getlastSynchroTable: function (nom_collection) {

        let maxdate = HistoSync.aggregate([{
            $match: {
                nom_collection: nom_collection
            }
        }, {
            $group: {
                _id: null,
                maxdate: {
                    $max: "$date_debut_synchro"
                }
            }
        }]);
        //console.log(maxdate);
        return maxdate;
    },
    insertDateLastSynchroPaiements: function () {
        let Future = Npm.require('fibers/future');
        let fut = new Future();

        let datesynchro = Meteor.call('getlastSynchroTable', 'paiements');
        console.log('method getLastdatePaiements - ' + datesynchro[0].maxdate);
        if (datesynchro[0] === undefined) {

            let offset = 0;
            let limit = 500;
            let nontrouver = true;

            let config = JSON.parse(Assets.getText('config-server.json'));
            let remoteConnection = DDP.connect(config.url_serveur);
            console.log('Url: ' + config.url_serveur);

            let remotePaiements = new Mongo.Collection('paiements', remoteConnection);
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('paiements', function () {
                console.log('connection distant etablie ');
                console.log('count  ' + remotePaiements.find().count());

                do {
                    let paiementsLocal = Paiements.find({}, {
                        sort: {
                            date_paiement_auto: -1
                        },
                        limit: limit
                    }).fetch();

                    console.log('local count - ' + paiementsLocal.length);
                    let paiementsDistant = remotePaiements.find({}, {
                        sort: {
                            date_paiement_auto: -1
                        },
                        limit: limit
                    }).fetch();

                    console.log('distant count - ' + paiementsDistant.length);
                    let i = 0;
                    let dateFirstSynchro;
                    while (paiementsLocal[i] && nontrouver) {

                        for (j = 0; j < paiementsDistant.length; j++) {
                            if (paiementsDistant[j].recu_pdf == paiementsLocal[i].recu_pdf) {
                                dateFirstSynchro = paiementsDistant[j].date_paiement_auto;
                                console.log('date first synchro -pdf -' + paiementsLocal[i].recu_pdf + ' -date -' + dateFirstSynchro);
                                nontrouver = false;
                                let numero = Meteor.user() ? Meteor.user().profile.numero_agent : '199';
                                let object = {
                                    date_debut_synchro: dateFirstSynchro,
                                    nom_collection: 'paiements',
                                    numero_agent: numero
                                };
                                HistoSync.insert(object);
                                break;
                            }
                        };
                        i++;
                    };
                    offset = +500;

                }
                while (nontrouver);


                fut.return(true);

            });
        } else {
            return true;
        }

        return fut.wait();
    },
    paiementsTransaction: function (dataStrings) {
        let txid;
        let paiementsEnvoyes = JSON.parse(dataStrings);
        console.log('donnees recu ' + paiementsEnvoyes.length);

        try {
            txid = tx.start("Insert into Paiements Serveur");

            paiementsEnvoyes.forEach(function (element) {
                delete element._id;
                Paiements.insert(element, {
                    tx: true
                })
            });

            tx.commit();

            return true;
        } catch (e) {
            tx.undo(txid);
        }
        return false;
    },
    insertAgentPaiementsServer: function () {
        this.unblock();
        let datesynchro = Meteor.call('getlastSynchroTable', 'paiements');
        console.log('date sync : ' + datesynchro[0].maxdate);

        let paiements = Paiements.find({
            date_paiement_manuelle: {
                $gt: datesynchro[0].maxdate
            }
        }).fetch();

        //console.log('paiements: ' + JSON.stringify(paiements));

        try {

            let config = JSON.parse(Assets.getText('config-server.json'));
            let remoteConnection = DDP.connect(config.url_serveur);
            console.log('Url: ' + config.url_serveur);
            let result = remoteConnection.call('paiementsTranscation', JSON.stringify(paiements));
            return result;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            console.log(e);
            return false;
        }
        return paiements;

    },

    insertServerPaiementsToAgent: function () {
        this.unblock();
        let datedebut = new Date();
        let dateinit = Meteor.call('insertDateLastSynchroPaiements');
        console.log('date init ' + dateinit);
        let datesynchro = Meteor.call('getlastSynchroTable', 'paiements');
        console.log('date sync : ' + datesynchro[0].maxdate);

        try {

            let config = JSON.parse(Assets.getText('config-server.json'));
            let remoteConnection = DDP.connect(config.url_serveur);
            console.log('Url: ' + config.url_serveur);
            let paiementsAgent = Paiements.find({
                date_paiement_manuelle: {
                    $gt: datesynchro[0].maxdate
                }
            }).fetch();

            let numero = Meteor.user() ? Meteor.user().profile.numero_agent : '199';
            let paiementsServer = remoteConnection.call('getPaiementsServerLastSynchro', datesynchro[0].maxdate, numero);

            txid = tx.start("Insert server Paiements to Agent");

            paiementsServer.forEach(function (element) {
                delete element._id;
                Paiements.insert(element, {
                    tx: true
                })
            });
            let result = remoteConnection.call('paiementsTransaction', JSON.stringify(paiementsAgent));
            if (result) {

                let object = {
                    date_debut_synchro: datedebut,
                    nom_collection: 'paiements',
                    numero_agent: numero
                };
                HistoSync.insert(object);
                tx.commit();
                return true;

            }
            tx.undo(txid);
            return false;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            console.log(e);
            return false;
        }

    },

    getPaiementsServerLastSynchro: function (datesynchro, numero_agent) {

        let paiements = Paiements.find({
            date_paiement_manuelle: {
                $gte: datesynchro
            },
            'agent.numero_agent': {
                $ne: numero_agent
            }

        }).fetch();

        return paiements;

    }

});