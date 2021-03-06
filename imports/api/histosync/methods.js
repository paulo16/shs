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

        var fs = Npm.require('fs');
        var Future = Npm.require('fibers/future');
        var fut = new Future();

        let datesynchro = Meteor.call('getlastSynchroTable', 'paiements');
        //console.log('method getLastdatePaiements - ' + datesynchro[0]);
        if (datesynchro[0] === undefined) {


            let skip = 0;
            let limit = 500;
            let nontrouver = true;

            let config = JSON.parse(Assets.getText('config-server.json'));
            let remoteConnection = DDP.connect(config.url_serveur);
            console.log('Url: ' + config.url_serveur);
            console.log('status : ' + JSON.stringify(remoteConnection.status.connected));

            let remotePaiements = new Mongo.Collection('paiements', remoteConnection);
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('paiements', function () {
                console.log('connection distant etablie ');
                console.log('count  ' + remotePaiements.find().count());

                do {

                    let paiementsLocal = Paiements.find({}, {
                        skip: skip,
                        limit: limit,
                        sort: {
                            date_paiement_auto: -1
                        },
                    }).fetch();

                    console.log('local count -' + paiementsLocal.length);

                    let taille_distant = remotePaiements.find({}).count();
                    let i = 0;
                    let dateFirstSynchro;
                    let paiementsDistant;
                    while (paiementsLocal[i] && nontrouver) {
                        let limit2 = 1000;
                        let skip2 = 0;
                        paiementsDistant = remotePaiements.find({}, {
                            skip: skip2,
                            limit: limit2,
                            sort: {
                                date_paiement_auto: -1
                            }
                        }).fetch();


                        console.log('skip - ' + skip2 + ' - distant count - ' + paiementsDistant.length);

                        while (skip2 <= taille_distant && nontrouver) {

                            for (j = 0; j < paiementsDistant.length; j++) {

                                if (paiementsDistant[j].recu_pdf == paiementsLocal[i].recu_pdf) {
                                    dateFirstSynchro = paiementsDistant[j].date_paiement_auto;
                                    console.log('date first synchro -pdf -' + paiementsLocal[i].recu_pdf + ' -date -' + dateFirstSynchro);
                                    nontrouver = false;
                                    let numero = Meteor.user() ? Meteor.user().profile.numero_agent : '199';
                                    let object = {
                                        date_debut_synchro: dateFirstSynchro,
                                        nom_collection: 'paiements',
                                        recu_pdf: paiementsLocal[i].recu_pdf,
                                        numero_agent: numero
                                    };
                                    HistoSync.insert(object);
                                    break;
                                }

                            };
                            skip2 += 1000;

                            paiementsDistant = remotePaiements.find({}, {
                                skip: skip2,
                                limit: limit2,
                                sort: {
                                    date_paiement_auto: -1
                                }
                            }).fetch()
                        }

                        i++;
                    };
                    skip += 500;

                }
                while (nontrouver);
                fut.return(true);
            });
        } else {
            fut.return(true);
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

        console.log('status : ' + JSON.stringify(remoteConnection.status.connected));

        try {

            let config = JSON.parse(Assets.getText('config-server.json'));
            let remoteConnection = DDP.connect(config.url_serveur);
            console.log('Url: ' + config.url_serveur);
            console.log('status : ' + JSON.stringify(remoteConnection.status));

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
        let status = Meteor.call('checkConnection');
        console.log('status connect : ' + status);
        try {
            if (dateinit && status) {
                console.log('date init ' + dateinit);
                let datesynchro = Meteor.call('getlastSynchroTable', 'paiements');
                console.log('date sync : ' + JSON.stringify(datesynchro[0]));

                let config = JSON.parse(Assets.getText('config-server.json'));
                let remoteConnection = DDP.connect(config.url_serveur);
                console.log('Url: ' + config.url_serveur);
                console.log('status : ' + JSON.stringify(remoteConnection.status()));

                let paiementsAgent = Paiements.find({
                    date_paiement_auto: {
                        $gt: datesynchro[0].maxdate
                    }
                }).fetch();
                let nbrepaiementsEnvoyes = paiementsAgent.length;

                let numero = Meteor.user() ? Meteor.user().profile.numero_agent : '199';
                let paiementsServer = remoteConnection.call('getPaiementsServerLastSynchro', datesynchro[0].maxdate, numero);
                console.log('paiements distant : ' + JSON.stringify(paiementsServer));
                let nbrepaiementsRecus = paiementsServer.length;
                txid = tx.start("Insert server Paiements to Agent");

                paiementsServer.forEach(function (element) {
                    delete element._id;
                    Paiements.insert(element, {
                        tx: true
                    })
                });
                let result = remoteConnection.call('paiementsTransaction', JSON.stringify(paiementsAgent));
                if (result) {
                    let p = Paiements.findOne({}, {
                        limit: 1,
                        sort: {
                            date_paiement_auto: -1
                        }
                    });

                    let object = {
                        date_debut_synchro: datedebut,
                        nom_collection: 'paiements',
                        recu_pdf: p.recu_pdf ? p.recu_pdf : 'aucun-pdf',
                        numero_agent: numero
                    };
                    HistoSync.insert(object);
                    tx.commit();
                    return {
                        recus: nbrepaiementsRecus,
                        envoyes: nbrepaiementsEnvoyes
                    };

                }
                tx.undo(txid);
                return false;
            }
            return false;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            console.log(e);
            return false;
        }

    },

    getPaiementsServerLastSynchro: function (datesynchro, numero_agent) {

        let paiements = Paiements.find({
            date_paiement_auto: {
                $gte: datesynchro
            },
            'agent.numero_agent': {
                $ne: numero_agent
            }

        }).fetch();

        return paiements;

    },

    testSkip: function () {
        let paiements = Paiements.find({}, {
            skip: 10,
            limit: 10,
            sort: {
                date_paiement_auto: 1
            }
        }).fetch();
        return paiements;

    },

    checkConnection: function () {
        'use strict';
        var fs = Npm.require('fs');
        var Future = Npm.require('fibers/future');
        var fut = new Future();

        let MeteorPing = require('meteor-ping');
        let config = JSON.parse(Assets.getText('config-server.json'));
        console.log('url: ' + config.url_self);

        // all args are optional, here are the defaults 
        var localApp = new MeteorPing({
            host: config.url_self,
            port: 3000,
            ssl: false,
            connectTimeout: 10 * 1000, // 10 seconds 
            //subscribeTimeout: 10 * 1000,
            // collection: 'paiements'
        });

        localApp.ping(Meteor.bindEnvironment(function (error, result) {
            if (error) {
                console.error(error);
                fut.return(false);
            } else {
                console.log('done. Milliseconds elapsed: ' + result.elapsedTimeInMs);
                fut.return(true);
            }

        }));
        return fut.wait();
    }

});