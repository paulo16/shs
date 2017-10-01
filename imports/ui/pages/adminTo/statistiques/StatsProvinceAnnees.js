import './StatsProvinceAnnees.html';
import '/imports/ui/components/statistiques/StatsProvinceAnnees.js';


Template.PageStatsProvinceAnnees.onRendered(function () {

    let montantTotal = this.find('#montant-total');
    let nbreClient = this.find('#nbre-client');
    let nbreProvince = this.find('#nbre-province');
    let nbreAgent = this.find('#nbre-agent');


    Meteor.call('montantTotal', (error, result) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(result[0]);
            let montant = numberWithCommas(result[0].total);
            montantTotal.append(montant);
        }
    });

    Meteor.call('nombreClient', (error, result) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(result[0]);
            let clients = result;
            nbreClient.append(clients);
        }
    });


    Meteor.call('listeProvinces', (error, result) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(result[0]);
            let provinces = result.length;
            nbreProvince.append(provinces);
        }
    });

    Meteor.call('nombreAgent', (error, result) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(result[0]);
            nbreAgent.append(result);
        }
    });

});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


