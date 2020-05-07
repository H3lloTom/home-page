import React, { Fragment, useState, useCallback, useEffect } from 'react';
import {
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiButton,
  EuiImage,
  EuiSpacer
} from '@elastic/eui';
import AV from 'leancloud-storage';

const Billing = () => {
  const columns = [];
  const [items, setItems] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: total,
    pageSizeOptions: [5, 10, 20]
  };
  const queryItems = useCallback(
    async (index = pageIndex, size = pageSize) => {
      const query = new AV.Query('Billing');
      query.descending('createdAt');
      const total = await query.count();
      const billingItems = await query
        .skip(index * size)
        .limit(size)
        .find();
      setTotal(total);
      setItems(billingItems);
      setPageIndex(index);
      setPageSize(size);
    },
    [pageIndex, pageSize]
  );
  const onTableChange = change => {
    const { page, sort } = change;
    if (page) {
      const { index, size } = page;
      queryItems(index, size);
    }
  };
  useEffect(() => {
    queryItems();
  }, []);
  return (
    <>
      <EuiFlexGroup></EuiFlexGroup>
      <EuiBasicTable
        columns={columns}
        items={items}
        onChange={onTableChange}
        pagination={pagination}></EuiBasicTable>
    </>
  );
};

export default Billing;
