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
import {
    exists
} from 'fs';


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
        var varexitances;
        let dateISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        let dateRegExp1 = /^(\d{2})\/(\d{2})\/(\d{4})(\s([0-1][0-9]|2[0-3]):([0-5][0-9])(\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00)))?){0,1}$/;

        let dateRegExp2 = /^([0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}){1}(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item) {

                let dtupdate;
                // console.log('item: ' + JSON.stringify(item));
                //console.log('dtupdate: ' + dateRegExp1.test(item.dtupdate));
                if (dateRegExp1.test(item.dtupdate)) {
                    dtu = item.dtupdate;
                    // console.log('tab dtupdate: ' + JSON.stringify(dtu));
                    dtupdate = dtu.split("/");
                    day = dtupdate[0].replace(/\s+/g, 'T');
                    anneeHeure = dtupdate[2].split(" ");
                    annee = anneeHeure[0];
                    heure = anneeHeure[1];
                    mois = dtupdate[1];
                    dt = annee + "-" + mois + "-" + day + "T" + heure;
                    // console.log('0: ' +dtupdate[0]);
                    // console.log('1: ' +dtupdate[1]);
                    //console.log('2: ' +dtupdate[2]);
                    //console.log('date auto: ' + dt);
                    dtupdate = new Date(dt);
                } else if (dateRegExp2.test(item.dtupdate)) {
                    dt = item.dtupdate;
                    dtupdate = dt.replace(/\s+/g, 'T');
                    //console.log('date mise service: ' + dtupdate);
                    dtupdate = new Date(dtupdate);
                } else if (dateISO.test(item.dtupdate)) {
                    dtupdate = new Date(item.dtupdate);
                } else {
                    console.log('Problème date : ' + item.dtservice + " -pdf : " + item.filename);
                    //dtService = new Date("2001-01-01T00:00:00.000Z");
                }


                let dateSave;
                //console.log('dtSave: ' + dateRegExp1.test(item.dateSave));
                if (dateRegExp1.test(item.dateSave)) {
                    dtu = item.dateSave;
                    // console.log('tab dtupdate: ' + JSON.stringify(dtu));
                    dateSave = dtu.split("/");
                    day = dateSave[0].replace(/\s+/g, 'T');
                    anneeHeure = dateSave[2].split(" ");
                    annee = anneeHeure[0];
                    heure = anneeHeure[1];
                    mois = dateSave[1];
                    dt = annee + "-" + mois + "-" + day + "T" + heure;
                    // console.log('0: ' +dtupdate[0]);
                    // console.log('1: ' +dtupdate[1]);
                    //console.log('2: ' +dtupdate[2]);
                    //console.log('date manuelle: ' + dt);
                    dateSave = new Date(dt);
                } else if (dateRegExp2.test(item.dateSave)) {
                    dt = item.dateSave;
                    dateSave = dt.replace(/\s+/g, 'T');
                    // console.log('date mise service: ' + dtService);
                    dateSave = new Date(dateSave);
                } else if (dateISO.test(item.dateSave)) {
                    dateSave = new Date(item.dateSave);
                } else {
                    console.log('Problème date : ' + item.dtservice + " -pdf : " + item.filename);
                    //dtService = new Date("2001-01-01T00:00:00.000Z");
                }
                let varfind = {
                    "recu_pdf": item.filename
                };

                varexitances = Paiements.findOne(varfind);
                //console.log('varfind:' + JSON.stringify(varfind));
                //console.log('exist:' + JSON.stringify( varexitances));

                if (!varexitances) {
                    if (item.total != '' && item.total != undefined) {

                        let agent = {
                            numero_agent: item.agent,
                            lastName: item.lastname
                        };
                        let dtService = item.dtservice;
                        if (dateRegExp1.test(item.dtservice)) {
                            dtu = item.dtservice;
                            // console.log('tab dtupdate: ' + JSON.stringify(dtu));
                            dtservice = dtu.split("/");
                            day = dtservice[0].replace(/\s+/g, 'T');
                            anneeHeure = dtservice[2].split(" ");
                            annee = anneeHeure[0];
                            heure = anneeHeure[1];
                            mois = dtservice[1];
                            dt = annee + "-" + mois + "-" + day + "T" + heure;
                            // console.log('0: ' +dtupdate[0]);
                            // console.log('1: ' +dtupdate[1]);
                            //console.log('2: ' +dtupdate[2]);
                            console.log('date service: ' + dt);
                            dtService = new Date(dt);
                        } else if (dateRegExp2.test(item.dtservice)) {
                            dtService = dtService.replace(/\s+/g, 'T');
                            //console.log('date mise service: ' + dtService);
                            dtService = new Date(dtService);
                        } else if (dateISO.test(item.dtservice)) {
                            dtService = new Date(item.dtservice);
                        } else {
                            console.log('Problème date service: ' + item.dtservice + " -pdf : " + item.filename);
                            dtService = new Date("2001-01-01T00:00:00.000Z");
                        }

                        let client = {
                            ref_contrat: item.ref_customer,
                            nom: item.nom,
                            prenom: item.prenom,
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
                            date_paiement_auto: dtupdate,
                            date_paiement_manuelle: dateSave,
                        }
                        Paiements.insert(paiement);
                    }
                }

            }
        }

        console.warn('Insertion complete .');
        return Paiements.find({}).count();
    },

    parseUpdatePaiements: function (data) {
        // Insertion des clients
        var varexitances;
        let dateISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        let dateRegExp1 = /^(\d{2})\/(\d{2})\/(\d{4})(\s([0-1][0-9]|2[0-3]):([0-5][0-9])(\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00)))?){0,1}$/;

        let dateRegExp2 = /^([0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}){1}(\s([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?){0,1}$/;

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item.filename != '' && item.filename != undefined) {
                //console.log('item: ' + JSON.stringify(item));
                let dtupdate;
                //console.log('dtupdate: ' + dateRegExp1.test(item.dtupdate));
                if (dateRegExp1.test(item.dtupdate)) {
                    dtu = item.dtupdate;
                    // console.log('tab dtupdate: ' + JSON.stringify(dtu));
                    dtupdate = dtu.split("/");
                    day = dtupdate[0].replace(/\s+/g, 'T');
                    anneeHeure = dtupdate[2].split(" ");
                    annee = anneeHeure[0];
                    heure = anneeHeure[1];
                    mois = dtupdate[1];
                    dt = annee + "-" + mois + "-" + day + "T" + heure;
                    // console.log('0: ' +dtupdate[0]);
                    // console.log('1: ' +dtupdate[1]);
                    //console.log('2: ' +dtupdate[2]);
                    //console.log('date auto: ' + dt);
                    dtupdate = new Date(dt);
                } else if (dateRegExp2.test(item.dtupdate)) {
                    dt = item.dtupdate;
                    dtupdate = dt.replace(/\s+/g, 'T');
                    //console.log('date mise service: ' + dtupdate);
                    dtupdate = new Date(dtupdate);
                } else if (dateISO.test(item.dtupdate)) {
                    dtupdate = new Date(item.dtupdate);
                } else {
                    console.log('Problème date : ' + item.dtservice + " -pdf : " + item.filename);
                    //dtService = new Date("2001-01-01T00:00:00.000Z");
                }


                let dateSave;
                //console.log('dtSave: ' + dateRegExp1.test(item.dateSave));
                if (dateRegExp1.test(item.dateSave)) {
                    dtu = item.dateSave;
                    // console.log('tab dtupdate: ' + JSON.stringify(dtu));
                    dateSave = dtu.split("/");
                    day = dateSave[0].replace(/\s+/g, 'T');
                    anneeHeure = dateSave[2].split(" ");
                    annee = anneeHeure[0];
                    heure = anneeHeure[1];
                    mois = dateSave[1];
                    dt = annee + "-" + mois + "-" + day + "T" + heure;
                    // console.log('0: ' +dtupdate[0]);
                    // console.log('1: ' +dtupdate[1]);
                    //console.log('2: ' +dtupdate[2]);
                    //console.log('date manuelle: ' + dt);
                    dateSave = new Date(dt);
                } else if (dateRegExp2.test(item.dateSave)) {
                    dt = item.dateSave;
                    dateSave = dt.replace(/\s+/g, 'T');
                    // console.log('date mise service: ' + dtService);
                    dateSave = new Date(dateSave);
                } else if (dateISO.test(item.dateSave)) {
                    dateSave = new Date(item.dateSave);
                } else {
                    console.log('Problème date : ' + item.dtservice + " -pdf : " + item.filename);
                    //dtService = new Date("2001-01-01T00:00:00.000Z");
                }

                let fichier = item.filename;
                fichier = fichier.replace(/\n|\r|\\n/g, "");
                let q = { montant: parseInt(item.total), recu_pdf: fichier };
                let p = Paiements.findOne(q);
                //console.log('Query ' + JSON.stringify(q));
                //console.log('Paiement ' + JSON.stringify(p));
                //console.log('fichier ' + fichier);

                if (item.total != '' && item.total != undefined) {

                    let res = Paiements.update({
                        recu_pdf: fichier,
                        montant: parseInt(item.total)
                    }, {
                            $set: {
                                date_paiement_auto: dtupdate,
                                date_paiement_manuelle: dateSave,
                            }
                        });

                    console.log('res ' + res);
                }
            }
        }

        console.warn('update date complete .');
        return Paiements.find({}).count();
    },
    findHistorique: function (saisi) {
        //let saisi = new RegExp(lasaisi);
        //let saisi = laci.replace(/ /g, "");

        let paiements = Paiements.find({
            $or: [{
                'client.cin': saisi
            },
            {
                'client.nom': saisi
            },
            {
                'client.prenom': saisi
            },
            {
                'client.ref_contrat': saisi
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
        let idp = Paiements.insert(paiement)
        let pdf = Meteor.call('generate_pdf', idp);
        return pdf;
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

    SumPaiementParClient: function (client, cin) {
        let paiements;
        if (client) {
            paiements = Paiements.aggregate([{
                $match: {
                    $or: [{
                        'client.cin': cin
                    }, {
                        'client.ref_contrat': client
                    }]
                }

            },
            {
                $group: {
                    _id: null,
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
            //console.log('paiements: ' + JSON.stringify(paiement));
            let dtpaie = moment(paiement.date_paiement_manuelle).format("DD-MM-YYYY-HH-mm-ss");
            let dtp = moment(paiement.date_paiement_manuelle).format("DD-MM-YYYY HH:mm:ss");
            paiement.datepaiement = dtp;
            let echeance = Math.floor(paiement.montant / 30);
            paiement.nbecheances = echeance;
            var data = {
                paiement: paiement
            };

            var str = paiement.client.ref_contrat;
            var nouvelleStr = str.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "-");
            var laci = paiement.client.cin;
            var lacin = laci.replace(/\s/g, "");
            console.log(lacin);

            var fileName = dtpaie + '-' + lacin + ".pdf";

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
                    if (err) {
                        console.log(err);
                        return null
                    }
                    newFile.name(fileName);
                    let fileObj = Pdfs.insert(newFile);
                    //console.log('insert pdf ok result: ', fileObj.original.name);
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
                    //console.log('insert pdf ok result: ', JSON.stringify(fileObj.url()));
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

    findPaiementByDay: function (filtre) {
        let paiements;
        //console.log('agent : ' + JSON.stringify(filtre));
        if (filtre.agent) {
            let agent = Meteor.users.findOne({
                username: filtre.agent
            });

            paiements = Paiements.aggregate([{
                $match: {
                    $and: [{
                        date_paiement_manuelle: {
                            $gt: filtre.dateDebut,
                            $lt: filtre.dateFin
                        },
                        'agent.lastName': agent.profile.lastName
                    }]
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

        } else {
            paiements = Paiements.aggregate([{
                $match: {
                    $and: [{
                        date_paiement_auto: {
                            $gt: filtre.dateDebut,
                            $lt: filtre.dateFin
                        },
                    }]
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
        }


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