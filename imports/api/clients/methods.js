import {
    Meteor
} from 'meteor/meteor';
import 'meteor/meteorhacks:aggregate';
import {
    Clients
} from './clients.js';

Clients.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
        return true;
    },
    remove: function (userId, doc) {
        return true;
    }
});

Meteor.methods({

    parseUploadClient: function (data) {

        // Insertion des clients
        for (let i = 0; i < data.length; i++) {
            let dateRegExp = /^([0-2][0-9]{3})\-(0[1-9]|1[0-2])\-([0-2][0-9]|3[0-1])(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;
            let item = data[i];
            if (item) {
                exists = Clients.findOne({
                    'contrat.ref_contrat': item.ref_customer
                });

                let dtservice;
                if (item.dtservice != 'NULL' && item.dtservice != "" && item.dtservice != undefined) {
                    let dtserviceTable = (item.dtservice).split("-");
                    dtservice = new Date(dtserviceTable[0], dtserviceTable[1] - 1, dtserviceTable[2]);
                } else {
                    dtservice = dateRegExp.test(item.dtservice) ? item.dtservice : new Date('2001-01-01T00:00:00Z');
                }

                let contrat = {
                    ref_contrat: item.ref_customer,
                    date_mise_service: dtservice
                };

                let client = {
                    nom: item.nom,
                    prenom: item.prenom,
                    cin: item.cin,
                    province: item.province,
                    commune: item.commune,
                    village: item.village,
                    phone: item.phone,
                    gpsouest: item.gpsouest,
                    gpsnord: item.gpsnord,
                    contrat: contrat
                }
                Clients.insert(client);

            }
        }

        console.warn('Insertion complete .');
        return true;
    },

    findClient: function (saisi) {
        if (saisi) {
            let varsaisi = new RegExp(saisi);

            return Clients.findOne({
                $or: [{
                    cin: varsaisi
                }, {
                    nom: varsaisi
                }, {
                    prenom: varsaisi
                }, {
                    'contrat.ref_contrat': varsaisi
                }]
            });

        }
        return {};

    },

    insertClient: function (client) {
        Clients.insert(client);
    },

    listeProvinces: function () {
        let provinces = Clients.distinct('province');
        //console.log(provinces);
        return provinces;
    },

    nombreClient: function () {

        return Clients.find().count();

    },
    synchroClients: function () {
        var Future = Npm.require('fibers/future');
        var fut = new Future();

        var config = JSON.parse(Assets.getText('config-server.json'));
        var remoteConnection = DDP.connect(config.url_serveur);
        console.log('Url: ' + config.url_serveur);
        if (remoteConnection) {
            console.log('Debut synchro clients');
            var remoteClients = new Mongo.Collection('clients', remoteConnection);
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('clients', function () {

                // Find in items and observe changes
                remoteClients.find().observeChanges({

                    // When collection changed, find #results element and publish result inside it
                    changed: function (id, fields) {
                        console.log('NEW-' + JSON.stringify(fields));
                        Clients.update({
                            'contrat.ref_contrat': fields.contrat.ref_contrat
                        }, {
                            $set: {
                                nom: fields.nom,
                                prenom: fields.prenom,
                                cin: fields.cin,
                                province: fields.province,
                                commune: fields.commune,
                                village: fields.village,
                                'contrat.date_mise_service': fields.contrat.date_mise_service,
                            }
                        }, {
                            upsert: true
                        });
                    },
                    added: function (id, fields) {
                        Clients.update({
                            'contrat.ref_contrat': fields.contrat.ref_contrat
                        }, {
                            $set: {
                                nom: fields.nom,
                                prenom: fields.prenom,
                                cin: fields.cin,
                                province: fields.province,
                                commune: fields.commune,
                                village: fields.village,
                                'contrat.date_mise_service': fields.contrat.date_mise_service,
                            }
                        }, {
                            upsert: true
                        });

                        //console.log('add-' + JSON.stringify(fields));
                    },
                    removed: function (id) {
                        console.log('remove-' + JSON.stringify(id));
                        Clients.remove(id);
                    }
                });
                console.log('synchro down collection distante ok ');

                let clientsLocals = Clients.find({}, {
                    fields: {
                        'contrat.ref_contrat': 1
                    }
                }).fetch();
                let arrclientsLocals = [];
                clientsLocals.forEach(function (element) {
                    arrclientsLocals.push(element.contrat.ref_contrat);
                });

                let clientDistants = remoteClients.find({}, {
                    fields: {
                        'contrat.ref_contrat': 1
                    }
                }).fetch();
                let arrclientDistants = [];
                clientDistants.forEach(function (element) {
                    arrclientDistants.push(element.contrat.ref_contrat);
                });

                let array_contrat_remote = _.uniq(_.difference(arrclientsLocals, arrclientDistants));
                console.log('array_contrat_remote :' + JSON.stringify(array_contrat_remote));
                let array_clients_addremote = Clients.find({
                    'contrat.ref_contrat': {
                        $in: array_contrat_remote
                    }
                }).fetch();
                console.log(' array_clients_addremote :' + JSON.stringify(array_clients_addremote));

                array_clients_addremote.forEach(function (element) {
                    delete element._id;
                    //console.log(element);
                    remoteClients.insertClient(element);
                });
                console.log('synchro up collection distante ok ');

                fut.return("Synchronisation Clients complete !");
            });

        }

        return fut.wait();
    },

    updateClient: function (client) {
        let Future = Npm.require('fibers/future');
        let fut = new Future();
        //let paiement = Clients.find({ _id: paie._id });

        Clients.update({
            _id: client._id
        }, {
            $set: {
                nom: client.nom,
                prenom: client.prenom,
                cin: client.cin,
                'contrat.ref_contrat': client.contrat.ref_contrat,
                'contrat.date_mise_service': client.contrat.date_mise_service,
            }
        }, Meteor.bindEnvironment(function (err) {
            if (err) {
                console.log(err);
            } else {
                fut.return(client._id);
            }
        }));

        return fut.wait();

    },
    removeClient: function (id) {
        let Future = Npm.require('fibers/future');
        let fut = new Future();
        //console.log('id : ' + id);
        Clients.remove({
            _id: id
        }, (err) => {
            if (err) throw new Meteor.Error("suppression", "erreur lors de la suppresion", err);
            fut.return(true);
        });
        return fut.wait();
    },

    findClientById: function (id) {
        let client = Clients.findOne({
            _id: id
        });
        //console.log(client);
        return client;
    },

});