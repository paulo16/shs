import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';


export default class RemotePaging extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let options = {
      sizePerPage: this.props.sizePerPage,
      onPageChange: this.props.onPageChange,
      onFilterChange: this.props.onFilterChange,
      onSearchChange: this.props.onSearchChange,
      onSortChange: this.props.onSortChange,
      onExportToCSV: this.props.onExportToCSV,
      paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
      sizePerPageList: [5, 10, 20],
      page: this.props.currentPage,
      onSizePerPageList: this.props.onSizePerPageList,
      paginationShowsTotal: this.props.renderShowsTotal,
      noDataText: 'Aucune donnée trouvée'
    };

    return (
      <div className="page-inner">
        <div className="page-title">
          <h3 className="breadcrumb-header">Paiements</h3>
          <div className="page-breadcrumb">
            <ol className="breadcrumb breadcrumb-with-header">
              <li><a href="index.html">Home</a></li>
              <li><a href="#">Paiements</a></li>
              <li className="active">Liste</li>
            </ol>
          </div>
        </div>
        <div id="main-wrapper">
          <div className="row">
            <div className="panel panel-white">
              <div className="panel-heading clearfix">
                <h4 className="panel-title">Basic example</h4>
              </div>
              <div className="panel-body">

                <BootstrapTable data={this.props.paiements} search={true} bordered={false} remote={true} pagination={true} exportCSV={true}
                  fetchInfo={{ dataTotalSize: this.props.totalDataSize }}
                  options={options} striped hover condensed>
                  <TableHeaderColumn dataField='_id' isKey={true} headerAlign='center' dataAlign='center'>Product ID</TableHeaderColumn>
                  <TableHeaderColumn dataField='client.nom' dataSort={true} headerAlign='center' dataAlign='center' filter={{ type: 'TextFilter', placeholder: 'Entrer une valeur' }}>Product Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='montant' dataSort={true} headerAlign='center' dataAlign='center'>Product Price</TableHeaderColumn>
                </BootstrapTable>


              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}