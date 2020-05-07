import React, { useState, useCallback, useEffect } from 'react';
import {
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiBadge,
  EuiButton,
  EuiImage,
  EuiSpacer,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiSuperDatePicker,
  EuiComboBox
} from '@elastic/eui';
import moment from 'moment';
import ac from 'accounting';
import AV from 'leancloud-storage';
import { BillingItem } from '../components';

const typeMap = {
  out: {
    label: '支出',
    color: 'danger'
  },
  in: {
    label: '收入',
    color: 'secondary'
  }
};

const options = [
  {
    label: '支出',
    id: 'out',
    color: 'danger'
  },
  {
    label: '收入',
    id: 'in',
    color: 'secondary'
  }
];

const Billing = () => {
  const columns = [
    {
      field: 'type',
      name: '款项',
      render: (val, item) => (
        <EuiBadge color={typeMap[item.get('type')].color}>
          {typeMap[item.get('type')].label}
        </EuiBadge>
      )
    },
    {
      field: 'amount',
      name: '金额',
      render: (val, item) => ac.formatMoney(item.get('amount'), '￥')
    },
    {
      field: 'description',
      name: '详情',
      render: (val, item) => item.get('description')
    },
    {
      field: 'createBy',
      name: '创建人',
      render: (val, item) => item.get('createdBy').getUsername()
    },
    {
      field: 'createdAt',
      name: '创建日期',
      render: (val, item) =>
        moment(item.get('createdAt')).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      name: '操作',
      actions: [
        {
          name: 'Alter',
          description: '修改账单',
          icon: 'documentEdit',
          color: 'primary',
          type: 'icon',
          onClick: item => {
            setActiveId(item.id);
            setAlterModalVisible(true);
          }
        },
        {
          type: 'icon',
          icon: 'trash',
          color: 'danger',
          name: 'Delete',
          description: '删除',
          onClick: item => {}
        }
      ]
    }
  ];
  const [activeId, setActiveId] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [alterModalVisible, setAlterModalVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: total,
    pageSizeOptions: [5, 10, 20]
  };
  const queryItems = async (index = pageIndex, size = pageSize) => {
    const query = new AV.Query('Billing');
    query.descending('createdAt');
    start && query.greaterThanOrEqualTo('createdAt', start.toDate());
    end && query.lessThanOrEqualTo('createdAt', end.toDate());
    selectedOptions.length > 0 &&
      query.containedIn(
        'type',
        selectedOptions.map(s => s.id)
      );
    query.include('createdBy');
    const total = await query.count();
    const billingItems = await query
      .skip(index * size)
      .limit(size)
      .find();
    setTotal(total);
    setItems(billingItems);
    setPageIndex(index);
    setPageSize(size);
  };
  const onTableChange = change => {
    const { page, sort } = change;
    if (page) {
      const { index, size } = page;
      queryItems(index, size);
    }
  };
  const onCreate = () => {
    setAddModalVisible(false);
    queryItems();
  };
  const onSave = () => {
    setAlterModalVisible(false);
    queryItems();
  };
  useEffect(() => {
    queryItems(0);
  }, [start, end, selectedOptions]);
  return (
    <>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem style={{ width: 300 }} grow={false}>
          <EuiComboBox
            placeholder="款项类型"
            options={options}
            selectedOptions={selectedOptions}
            onChange={setSelectedOptions}></EuiComboBox>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiDatePickerRange
            startDateControl={
              <EuiDatePicker
                selected={start}
                onChange={setStart}
                onClear={() => setStart(null)}
                dateFormat="YYYY-MM-DD"
              />
            }
            endDateControl={
              <EuiDatePicker
                selected={end}
                onChange={setEnd}
                onClear={() => setEnd(null)}
                dateFormat="YYYY-MM-DD"
              />
            }
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => setAddModalVisible(true)}>记账</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiBasicTable
        tableLayout="auto"
        columns={columns}
        items={items}
        onChange={onTableChange}
        pagination={pagination}></EuiBasicTable>
      {addModalVisible && (
        <BillingItem
          type="add"
          onClose={() => setAddModalVisible(false)}
          onConfirm={onCreate}></BillingItem>
      )}
      {alterModalVisible && (
        <BillingItem
          type="alter"
          id={activeId}
          onClose={() => setAlterModalVisible(false)}
          onConfirm={onSave}></BillingItem>
      )}
    </>
  );
};

export default Billing;
