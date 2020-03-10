import React, { useState, useEffect } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiFieldText,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiSuperSelect,
  EuiHealth
} from '@elastic/eui';
import moment from 'moment';
import schema from 'async-validator';
import AV from 'leancloud-storage';

import styles from './index.module.scss';

const descriptor = {
  goodsId: {
    type: 'string',
    required: true
  },
  color: {
    type: 'string',
    required: true
  },
  size: {
    type: 'string',
    required: true
  },
  number: {
    type: 'integer',
    required: true
  },
  subTotal: {
    type: 'number',
    required: true
  }
};

const validator = new schema(descriptor);

const SUB_ORDER_TEMPLATE = {
  goodsId: '',
  color: '',
  size: '',
  number: 0,
  subTotal: 0
};

const Purchase = () => {
  const [purchaseDate, setPurchaseDate] = useState(moment());
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [items, setItems] = useState([]);
  const onAddItem = async () => {
    const nextItems = items.concat({
      ...SUB_ORDER_TEMPLATE,
      index: items.length
    });
    setItems(nextItems);
  };
  const queryDict = async () => {
    const colorQuery = new AV.Query('Color');
    const sizeQuery = new AV.Query('Size');
    let colors = await colorQuery.limit(1000).find();
    let sizes = await sizeQuery.limit(1000).find();
    const colorOptions = colors.map(c => ({
      value: c.get('hex'),
      inputDisplay: (
        <EuiHealth color={'#' + c.get('hex')}>{c.get('name')}</EuiHealth>
      )
    }));
    const sizeOptions = sizes.map(c => ({
      value: c.get('value'),
      inputDisplay: c.get('name'),
      dropdownDisplay: <strong>{c.get('name')}</strong>
    }));
    setColorOptions(colorOptions);
    setSizeOptions(sizeOptions);
  };
  const onChangeTableRow = (index, key, val) => {
    const nextItems = [...items];
    nextItems[index][key] = val;
    setItems(nextItems);
  };
  const columns = [
    {
      field: 'goodsId',
      name: '商品',
      render: (val, item) => {}
    },
    {
      field: 'color',
      name: '颜色',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              valueOfSelected={val}
              onChange={value => onChangeTableRow(item.index, 'color', value)}
              itemLayoutAlign="center"
              options={colorOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'size',
      name: '尺寸',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              onChange={value => onChangeTableRow(item.index, 'size', value)}
              valueOfSelected={val}
              itemLayoutAlign="top"
              options={sizeOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'number',
      name: '数量',
      render: () => {}
    },
    {
      field: 'subTotal',
      name: '小计',
      render: () => {}
    }
  ];
  useEffect(() => {
    queryDict();
  }, []);
  return (
    <EuiForm>
      <EuiFormRow display="rowCompressed" label="采购日期">
        <EuiDatePicker
          selected={purchaseDate}
          onChange={setPurchaseDate}
          dateFormat="YYYY/MM/DD"
          locale="zh-cn"
          maxDate={moment()}></EuiDatePicker>
      </EuiFormRow>
      <EuiFormRow display="rowCompressed" label="采购人">
        <EuiFieldText></EuiFieldText>
      </EuiFormRow>
      <EuiFormRow fullWidth label="商品清单">
        <React.Fragment>
          <EuiSpacer size="l" />
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={onAddItem} size="s">
                新增条目
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem />
          </EuiFlexGroup>

          <EuiSpacer size="l" />
          <EuiBasicTable
            isSelectable
            items={items}
            itemId="id"
            columns={columns}></EuiBasicTable>
        </React.Fragment>
      </EuiFormRow>
    </EuiForm>
  );
};

export default Purchase;
