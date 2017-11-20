import {
    Meteor
} from 'meteor/meteor';
import 'meteor/meteorhacks:aggregate';
import moment from 'moment';
import webshot from 'webshot';
import {
    SSR,
    Template
} from 'meteor/meteorhacks:ssr';
import {
    Paiements
} from './paiements.js';
import {
    Pdfs
} from '/imports/api/pdfs/pdfs.js';
import {
    HistoSync
} from '/imports/api/histosync/histosync.js';

Paiements.allow({
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

    parseUploadPaiements: function (data) {
        // Insertion des clients

        let dateRegExp = /^([0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}){1}(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;
        let dateRegExp1 = /^(\d{2})\/(\d{2})\/(\d{4})(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;
        let dateRegExp2 = /^([0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}){1}(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item) {
                exists = Paiements.findOne({
                    date_paiement_auto: item.dtupdate,
                    recu_pdf: item.filename
                });

                if (!exists && item.total != '' && item.total != undefined) {

                    let agent = {
                        numero_agent: item.agent,
                        lastName: item.lastname
                    };
                    let dtService;

                    if (dateRegExp1.test(item.dtservice)) {
                        dtServiceIter = (item.dtservice).split("/");
                        dtService = new Date(dtServiceIter[2], dtServiceIter[1] - 1, dtServiceIter[0]);
                    } else if (dateRegExp2.test(item.dtservice)) {
                        dtServiceIter = (item.dtservice).split("-");
                        dtService = new Date(dtServiceIter[0], dtServiceIter[1] - 1, dtServiceIter[2]);
                    } else {
                        dtService = new Date('2001-01-01T00:00:00Z');
                    }

                    let client = {
                        ref_contrat: item.ref_customer,
                        nom: item.nom,
                        cin: item.cin,
                        province: item.province,
                        commune: item.commune,
                        village: item.village,
                        date_mise_service: dtService,
                    };

                    let paiement = {
                        agent: agent,
                        client: client,
                        montant: item.total,
                        type_paiement: item.typerecu,
                        recu_pdf: item.filename,
                        date_paiement_auto: dateRegExp.test(item.dtupdate) ? item.dtupdate : dateRegExp.test(item.dtSave) ? item.dtSave : new Date('2001-01-01T00:00:00Z'),
                        date_paiement_manuelle: dateRegExp.test(item.dtSave) ? item.dtSave : dateRegExp.test(item.dtupdate) ? item.dtupdate : new Date('2001-01-01T00:00:00Z'),
                    }
                    Paiements.insert(paiement);
                }
            }
        }

        console.warn('Insertion complete .');
        return Paiements.find({}).count();
    },

    findHistorique: function (saisi) {
        let varsaisi = new RegExp(saisi);

        let paiements = Paiements.find({
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
                    'client.ref_contrat': varsaisi
                }
            ]
        }).fetch();
        //console.log(paiements);
        return paiements;
    },

    findAllPaiements: function () {

        return Paiements.find().fetch();
    },

    allPaiements: function (search, regex, pagination, params) {
        //console.log('--search-' + search + '--regex-' + regex + '--params-' + JSON.stringify(params));
        var searchParam = Meteor.call("RDParseSearchServerSide", search, regex);
        return {
            data: Paiements.find(searchParam, pagination).fetch(),
            total: Paiements.find().count(),
            filtered: Paiements.find(searchParam).count()
        }
    },
    insertPaiement: function (paiement) {
        let valretour;
        return Paiements.insert(paiement);
    },
    findClientParProvince: function () {

        let clients = Paiements.aggregate([{
                $group: {
                    _id: "$client.province",
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: 1
                }
            }
        ]);
        //console.log(clients);

        return clients;

    },

    findPaiementParProvince: function (datedebut, datefin) {
        let paiements;
        if (datedebut && datefin) {
            paiements = Paiements.aggregate([{
                    $match: {
                        date_paiement_manuelle: {
                            $gt: datedebut,
                            $lt: datefin
                        }
                    }
                },
                {
                    $group: {
                        _id: "$client.province",
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

            return paiements;

        } else {
            paiements = Paiements.aggregate([{
                    $group: {
                        _id: "$client.province",
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

            return paiements;
        }

    },

    MontantAnneeProvince: function (province) {
        let paiements;
        if (province) {
            paiements = Paiements.aggregate([{
                    $match: {
                        'client.province': province
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                "$year": "$date_paiement_manuelle"
                            }
                        },
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);
            ////console.log(paiements);
            return paiements;
        }

        paiements = Paiements.aggregate([{
                $group: {
                    _id: {
                        year: {
                            "$year": "$date_paiement_manuelle"
                        }
                    },
                    total: {
                        $sum: "$montant"
                    }
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ]);


        return paiements;

    },
    montantTotal: function () {

        let paiements = Paiements.aggregate([{
            $group: {
                _id: null,
                total: {
                    $sum: "$montant"
                }
            }
        }]);
        ////console.log(paiements);

        return paiements;

    },

    findPaiementParProvinceDate: function (dateMiseService, client, province, datedebut, datefin) {
        let paiements;
        if (datedebut && datefin) {
            paiements = Paiements.aggregate([{
                    $match: {
                        date_paiement_manuelle: {
                            $gt: datedebut,
                            $lt: datefin
                        }
                    }
                },
                {
                    $group: {
                        _id: "$client.province",
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

            return paiements;

        } else {
            paiements = Paiements.aggregate([{
                    $group: {
                        _id: "$client.province",
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

            return paiements;
        }

    },

    findMinDatePaiement: function () {

        let mindate = Paiements.aggregate([{
            $group: {
                _id: null,
                mindate: {
                    $min: "$date_paiement_manuelle"
                }
            }
        }]);
        ////console.log(paiements);
        return mindate;
    },

    SumPaiementParClient: function (client) {
        let paiements;
        if (client) {
            paiements = Paiements.aggregate([{
                    $match: {
                        $or: [{
                            'client.cin': client
                        }, {
                            'client.ref_contrat': client
                        }]
                    }

                },
                {
                    $group: {
                        _id: {
                            cin: "$client.cin",
                            date_mise_service: "$client.date_mise_service",
                        },
                        total: {
                            $sum: "$montant"
                        }
                    }
                },
            ]);

            //console.log('paiements -' + JSON.stringify(paiements));

            return paiements;
        }
        return {};

    },

    generate_pdf: function (id) {
        if (id) {

            // SETUP
            // Grab required packages
            // var webshot = Meteor.npmRequire('webshot');
            var fs = Npm.require('fs');
            var Future = Npm.require('fibers/future');
            ////console.log('future '+Future);

            var fut = new Future();
            var ladate = moment(new Date()).format("DD-MM-YYYY-HH-mm-ss");


            // GENERATE HTML STRING
            var css = Assets.getText('style.css');
            var image = Assets.getText('itelsys.jpg');

            SSR.compileTemplate('layout', Assets.getText('layout.html'));

            Template.layout.helpers({
                getDocType: function () {
                    return "<!DOCTYPE html>";
                }
            });

            SSR.compileTemplate('recu_paiement', Assets.getText('recu_paiement.html'));

            Template.recu_paiement.helpers({

                absoluteURL: function (uri) {
                    return Meteor.absoluteUrl(uri);
                }

            });

            // PREPARE DATA
            var paiement = Paiements.findOne({
                _id: id
            });
            let dtpaie = moment(paiement.date_paiement_manuelle).format("DD-MM-YYYY-HH-mm-ss");
            let dtp = moment(paiement.date_paiement_manuelle).format("DD-MM-YYYY HH:mm:ss");
            paiement.datepaiement = dtp;
            let echeance = Math.floor(paiement.montant / 30);
            paiement.nbecheances = echeance;
            var data = {
                paiement: paiement
            };

            var fileName = dtpaie + '-' + paiement.client.cin + '-' + paiement.client.ref_contrat + ".pdf";

            var html_string = SSR.render('layout', {
                css: css,
                template: "recu_paiement",
                data: data
            });

            var path = process.env['METEOR_SHELL_DIR'] + '/../../../public';
            // var relpath = fs.realpathSync('.');
            //var pathroot=relpath.replace(/\.meteor.*/,"");
            //console.log('path -' + relpath.replace(/\.meteor.*/,""));
            var pdf = require('html-pdf');
            //var html = fs.readFileSync(html_string, 'utf8');
            var options = {
                format: 'Letter'
            };
            /** 
            pdf.create(html_string, options).toFile(path + '/pdfs/' + fileName, Meteor.bindEnvironment(function (err, res) {
                if (err) fut.throw(err);
                //console.log(res); // { filename: '/app/businesscard.pdf' }
                Paiements.update({ _id: id }, { $set: { recu_pdf: res.filename } });
                fut.return(res);

            }));
            */


            pdf.create(html_string, options).toBuffer(Meteor.bindEnvironment(function (err, buffer) {
                //var buffer = new Buffer(JSON.stringify(jsonObj));
                let newFile = new FS.File();
                newFile.attachData(buffer, {
                    type: 'application/pdf'
                }, (err) => {
                    if (err) throw err;
                    newFile.name(fileName);
                    let fileObj = Pdfs.insert(newFile);
                    console.log('insert pdf ok result: ', fileObj.original.name);
                    Paiements.update({
                        _id: id
                    }, {
                        $set: {
                            recu_pdf: fileName
                        }
                    });
                    let monpdf = Pdfs.findOne({
                        _id: fileObj._id
                    });
                    console.log('insert pdf ok result: ', JSON.stringify(fileObj.url()));
                    fut.return(monpdf);
                });
            }));

            return fut.wait();
        } else {
            return null;
        }

    },

    synchroPaiements: function () {
        var Future = Npm.require('fibers/future');
        var fut = new Future();

        var config = JSON.parse(Assets.getText('config-server.json'));
        var remoteConnection = DDP.connect(config.url_serveur);
        console.log('Url: ' + config.url_serveur);

        if (remoteConnection.status != 'failed' && remoteConnection.status != 'offline') {
            console.log('Debut synchro ');
            var remotePaiements = new Mongo.Collection('paiements', remoteConnection);
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('paiements', function () {

                // Find in items and observe changes
                remotePaiements.find().observeChanges({

                    // When collection changed, find #results element and publish result inside it
                    changed: function (id, fields) {
                        //console.log('NEW-' + JSON.stringify(fields));
                        if (fields.emeteur_paiement_cin && fields.virement) {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                    emeteur_paiement_cin: fields.emeteur_paiement_cin,
                                    virement: fields.virement,

                                }
                            }, {
                                upsert: true
                            });
                        } else {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                }
                            }, {
                                upsert: true
                            });

                        }
                    },
                    added: function (id, fields) {
                        if (fields.emeteur_paiement_cin && fields.virement) {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                    emeteur_paiement_cin: fields.emeteur_paiement_cin,
                                    virement: fields.virement,

                                }
                            }, {
                                upsert: true
                            });
                        } else {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                }
                            }, {
                                upsert: true
                            });

                        }
                    },
                    removed: function (id) {
                        //console.log('remove-' + JSON.stringify(id));
                        Paiements.remove(id);
                    }
                });

                console.log('synchro down collection distante ok ');

                let paiementsLocals = Paiements.find({}, {
                    fields: {
                        recu_pdf: 1
                    }
                }).fetch();
                let arrpaiementsLocals = [];
                paiementsLocals.forEach(function (element) {
                    arrpaiementsLocals.push(element.recu_pdf);
                });

                let paiementstDistants = remotePaiements.find({}, {
                    fields: {
                        recu_pdf: 1
                    }
                }).fetch();
                let arrpaiementsDistants = [];
                paiementstDistants.forEach(function (element) {
                    arrpaiementsDistants.push(element.recu_pdf);
                });

                let array_recu_remote = _.uniq(_.difference(arrpaiementsLocals, arrpaiementsDistants));
                //console.log('array_recu_remote :' + JSON.stringify(array_recu_remote));
                let array_paiements_addremote = Paiements.find({
                    recu_pdf: {
                        $in: array_recu_remote
                    }
                }).fetch();
                //console.log(' array_paiements_addremote :' + JSON.stringify(array_paiements_addremote));

                array_paiements_addremote.forEach(function (element) {
                    delete element._id;
                    //console.log(element);
                    remotePaiements.insert(element);
                });
                console.log('synchro up collection distante ok ');

                fut.return("Synchronisation Paiements complete !");
            });

        } else {
            console.log('connection fermé coté distant ! veillez verifier ');
        }

        return fut.wait();
    },

    updatePaiement: function (paie) {
        let Future = Npm.require('fibers/future');
        let fut = new Future();
        //let paiement = Paiements.find({ _id: paie._id });

        Paiements.update({
            _id: paie._id
        }, {
            $set: {
                montant: paie.montant,
                date_paiement_manuelle: paie.date_paiement_manuelle,
            }
        }, Meteor.bindEnvironment(function (err) {
            if (err) {
                console.log(err);
            } else {
                fut.return(paie._id);
            }
        }));

        return fut.wait();

    },
    removePaiement: function (id) {
        let Future = Npm.require('fibers/future');
        let fut = new Future();
        //console.log('id : ' + id);
        Paiements.remove({
            _id: id
        }, (err) => {
            if (err) throw new Meteor.Error("suppression", "erreur lors de la suppresion", err);
            fut.return(true);
        });
        return fut.wait();
    },

    findPaiementByDay: function () {
        let paiements;
        let today = new Date();
        let datedebut = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);;
        let datefin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 0, 0);;

        paiements = Paiements.aggregate([{
                $match: {
                    date_paiement_manuelle: {
                        $gt: datedebut,
                        $lt: datefin
                    }
                }
            },
            {
                $group: {
                    _id: "$client.ref_contrat",
                    total: {
                        $sum: "$montant"
                    }
                }
            }
        ]);

        return paiements;
    },
    synchroPaiements2: function () {

        var Future = Npm.require('fibers/future');
        var fut = new Future();

        var config = JSON.parse(Assets.getText('config-server.json'));
        var remoteConnection = DDP.connect(config.url_serveur);
        console.log('Url: ' + config.url_serveur);

        if (remoteConnection.status != 'failed' && remoteConnection.status != 'offline') {
            console.log('Debut synchro ');
            var remotePaiements = new Mongo.Collection('paiements', remoteConnection);
            let datelastsynctab = getlastSynchroTable('paiements');
            if (datelastsynctab.length <= 0) {
                HistoSync.insert();

            }
            let datelastsync = datelastsynctab.maxdate;
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('paiements', function () {
                let query = remotePaiements.find({
                    date_paiement_manuelle: {
                        $gt: datelastsync
                    }
                });
                // Find in items and observe changes
                query.observeChanges({

                    // When collection changed, find #results element and publish result inside it
                    changed: function (id, fields) {
                        //console.log('NEW-' + JSON.stringify(fields));
                        if (fields.emeteur_paiement_cin && fields.virement) {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                    emeteur_paiement_cin: fields.emeteur_paiement_cin,
                                    virement: fields.virement,

                                }
                            }, {
                                upsert: true
                            });
                        } else {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                }
                            }, {
                                upsert: true
                            });

                        }
                    },
                    added: function (id, fields) {
                        if (fields.emeteur_paiement_cin && fields.virement) {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                    emeteur_paiement_cin: fields.emeteur_paiement_cin,
                                    virement: fields.virement,

                                }
                            }, {
                                upsert: true
                            });
                        } else {
                            Paiements.update({
                                recu_pdf: fields.recu_pdf
                            }, {
                                $set: {
                                    nom: fields.nom,
                                    agent: fields.agent,
                                    client: fields.client,
                                    montant: fields.montant,
                                    recu_pdf: fields.recu_pdf,
                                    date_paiement_auto: fields.date_paiement_auto,
                                    date_paiement_manuelle: fields.date_paiement_manuelle,
                                    type_paiement: fields.type_paiement,
                                }
                            }, {
                                upsert: true
                            });

                        }
                    },
                    removed: function (id) {
                        //console.log('remove-' + JSON.stringify(id));
                        Paiements.remove(id);
                    }
                });

                console.log('synchro down collection distante ok ');

                let paiementsLocals = Paiements.find({}, {
                    fields: {
                        recu_pdf: 1
                    }
                }).fetch();
                let arrpaiementsLocals = [];
                paiementsLocals.forEach(function (element) {
                    arrpaiementsLocals.push(element.recu_pdf);
                });

                let paiementstDistants = remotePaiements.find({}, {
                    fields: {
                        recu_pdf: 1
                    }
                }).fetch();
                let arrpaiementsDistants = [];
                paiementstDistants.forEach(function (element) {
                    arrpaiementsDistants.push(element.recu_pdf);
                });

                let array_recu_remote = _.uniq(_.difference(arrpaiementsLocals, arrpaiementsDistants));
                //console.log('array_recu_remote :' + JSON.stringify(array_recu_remote));
                let array_paiements_addremote = Paiements.find({
                    recu_pdf: {
                        $in: array_recu_remote
                    }
                }).fetch();
                //console.log(' array_paiements_addremote :' + JSON.stringify(array_paiements_addremote));

                array_paiements_addremote.forEach(function (element) {
                    delete element._id;
                    //console.log(element);
                    remotePaiements.insert(element);
                });
                console.log('synchro up collection distante ok ');

                fut.return("Synchronisation Paiements complete !");
            });

        } else {
            console.log('connection fermé coté distant ! veillez verifier ');
        }

        return fut.wait();
    },
    lastDatePaiementServeur: function () {
        let maxdate = Paiements.aggregate([{
            $group: {
                _id: null,
                maxdate: {
                    $max: "$date_paiement_automatique"
                }
            }
        }]);
        //console.log(maxdate);
        return maxdate;
    },

    removePaiements: function () {
        return Paiements.remove({});

    }
});