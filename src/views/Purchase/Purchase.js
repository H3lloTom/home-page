import React, { useState } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiFieldText,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButton
} from '@elastic/eui';
import moment from 'moment';

const Purchase = () => {
  const [purchaseDate, setPurchaseDate] = useState(moment());
  const columns = [
    {
      field: 'goodsId',
      name: '商品'
    },
    {
      field: 'number',
      name: '数量'
    },
    {
      field: 'price',
      name: '单价'
    },
    {
      field: 'subTotal',
      name: '小计'
    }
  ];
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
              <EuiButton size="s">新增条目</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem />
          </EuiFlexGroup>

          <EuiSpacer size="l" />
          <EuiBasicTable
            isSelectable
            items={[]}
            itemId="id"
            columns={columns}></EuiBasicTable>
        </React.Fragment>
      </EuiFormRow>
    </EuiForm>
  );
};

export default Purchase;
