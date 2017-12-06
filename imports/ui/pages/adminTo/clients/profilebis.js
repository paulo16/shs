import {
    Meteor
} from 'meteor/meteor';
import {
    Session
} from 'meteor/session';
import {
    Template
} from 'meteor/templating';
import {
    FlowRouter
} from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import './profilebis.html';
import {
    Clients
} from '/imports/api/clients/clients.js';

import {
    Paiements
} from '/imports/api/paiements/paiements.js';


Template.profilebis.onCreated(function () {
    let currentUrl = FlowRouter.current();
    let idclient = currentUrl.queryParams.id;
    let contrat = currentUrl.queryParams.ref_contrat;

    //console.log(contrat);
    //Session.set('info', {});
    Meteor.call('findClientById', idclient, (error, result) => {
        if (error) {
            console.log('erreur' + error);

        } else if (result) {
            //console.log('le resultat' + JSON.stringify(result));
            result.date_mise_service = moment(result.contrat.date_mise_service).format("DD-MM-YYYY HH:mm");
            result.ref_contrat = result.contrat.ref_contrat;
            Session.set('date_mise_service', result.contrat.date_mise_service);
            Session.set('info', result);
        }

    });

});

Template.profilebis.helpers({
    info() {

        let info = Session.get('info');
        if (info) {
            return info;
        }
        return {};
    },
});

Template.profilebis.onRendered(function () {
    let currentUrl = FlowRouter.current();
    let idclient = currentUrl.queryParams.id;
    let contrat = currentUrl.queryParams.ref_contrat;

    Meteor.call('SumPaiementParClient', contrat, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            if (result.length > 0) {
                Session.set('result2', result);
                let res2 = Session.get('result2');
                // console.log(JSON.stringify('les sommes ' + result));
                let element = '<div style="height: 70px;line-height: 70px;text-align: center;border: 1px dashed #f69c55;">';
                let date_mise_service = Session.get('date_mise_service');
                let scp = (monthDiff(date_mise_service, new Date()) * 30) + 30;
                let msp = monthDiff(date_mise_service, new Date()) + 1;
                let sp = res2[0].total ? res2[0].total : 0;
                let mp = Math.floor(sp / 30);
                let sa = Math.abs(scp - sp);
                let mpa = Math.abs(Math.floor(sa / 30));
                element += '<span>&nbsp;TOTAL PAYER (' + mp + ' mois):<b>&nbsp;' + sp + 'DH</b></span>';
                element += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>CENSE PAYER (' + msp + ' mois)<b>:&nbsp;' + scp + 'DH</b></span>';
                element += sp > scp ? '<span style="color:green;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AVANCE (' + mpa + ' mois) <b>:&nbsp;' + sa + 'DH </b></span>' : '<span style="color:red;">&nbsp;&nbsp;&nbsp;<b> RETARD (' + mpa + ' mois):&nbsp; ' + sa + 'DH</b></span>';
                element += '</div>'
                $('#les-montants').html(element);

            }
        }

    });

});

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}