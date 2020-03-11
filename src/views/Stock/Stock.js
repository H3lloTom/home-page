import React, { Fragment, useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiBasicTable,
  EuiTextColor
} from '@elastic/eui';
import AV from 'leancloud-storage';

const Stock = () => {
  const [items, setItems] = useState([]);
  const columns = [
    {
      name: '序号',
      render: (val, item) => {
        return <EuiTextColor></EuiTextColor>;
      }
    },
    {
      field: ''
    }
  ];
  const pagination = {
    pageIndex: 0,
    pageSize: 10
  };
  const onTableChange = () => {};
  const queryStocks = async () => {
    const query = new AV.Query('Stock');
    query.include('goods');
    const stocks = await query.find();
    console.log(stocks);
  };
  useEffect(() => {
    queryStocks();
  }, []);
  return (
    <Fragment>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiFieldSearch
            isClearable
            fullWidth
            placeholder="商品名/商品编码"></EuiFieldSearch>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiBasicTable
        columns={columns}
        items={items}
        onChange={onTableChange}
        pagination={pagination}></EuiBasicTable>
    </Fragment>
  );
};

export default Stock;
