/*
 * 账单item
 */
import React, { useState, useEffect } from 'react';
import {
  EuiButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiRadioGroup,
  EuiButtonEmpty,
  EuiFieldNumber,
  EuiTextArea,
  EuiFilePicker,
  EuiListGroup,
  EuiListGroupItem
} from '@elastic/eui';
import AV from 'leancloud-storage';
import schema from 'async-validator';

const types = [
  {
    label: '支出',
    id: 'out'
  },
  {
    label: '收入',
    id: 'in'
  }
];

const initData = {
  type: '',
  amount: 0,
  description: ''
};

const descriptor = {
  type: {
    type: 'string',
    required: true,
    message: '请选择款项类型'
  },
  amount: {
    type: 'number',
    required: true,
    validator(rule, value) {
      return value > 0;
    },
    message: '请输入大于0的金额'
  },
  description: {
    type: 'string',
    required: true,
    message: '请填写账单详情'
  }
};

const validator = new schema(descriptor);

const BillingItem = props => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [data, setData] = useState(initData);
  const onClose = () => {
    props.onClose();
  };
  const getFormRowProps = label => ({
    display: 'rowCompressed',
    label
  });
  const onConfirm = async () => {
    try {
      await validator.validate(data);
    } catch ({ errors }) {
      setConfirmLoading(false);
      setErrors(errors);
      return;
    }
    setErrors([]);
    setConfirmLoading(true);

    const user = AV.User.current();
    if (props.type === 'add') {
      const Billing = AV.Object.extend('Billing');
      const billing = new Billing();
      await billing.save({
        ...data,
        createdBy: user
      });
    } else if (props.type === 'alter') {
      const billing = AV.Object.createWithoutData('Billing', props.id);
      await billing.save({
        ...data,
        createdBy: user
      });
    }

    setConfirmLoading(false);
    props.onConfirm();
  };
  const handleChangeData = (key, value) => {
    setData({
      ...data,
      [key]: value
    });
  };
  const queryItem = async id => {
    const query = new AV.Query('Billing');
    const billing = await query.get(id);
    setData({
      type: billing.get('type'),
      amount: billing.get('amount'),
      description: billing.get('description')
    });
  };
  const errorMessages = errors.map(e => e.message);
  useEffect(() => {
    if (props.type === 'alter') {
      queryItem(props.id);
    }
  }, []);
  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {props.type === 'add' ? '新增' : '编辑'}账单
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
            <EuiFormRow {...getFormRowProps('款项')}>
              <EuiRadioGroup
                options={types}
                compressed
                idSelected={data.type}
                onChange={value => {
                  handleChangeData('type', value);
                }}></EuiRadioGroup>
            </EuiFormRow>
            <EuiFormRow {...getFormRowProps('金额')}>
              <EuiFieldNumber
                prepend="￥"
                placeholder="金额"
                compressed
                value={data.amount}
                onChange={e =>
                  handleChangeData('amount', +e.target.value)
                }></EuiFieldNumber>
            </EuiFormRow>
            <EuiFormRow {...getFormRowProps('详情')}>
              <EuiTextArea
                placeholder="详情"
                compressed
                value={data.description}
                onChange={e =>
                  handleChangeData('description', e.target.value)
                }></EuiTextArea>
            </EuiFormRow>
          </EuiForm>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose}>取消</EuiButtonEmpty>
          <EuiButton isLoading={confirmLoading} onClick={onConfirm} fill>
            保存
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

BillingItem.defaultProps = {
  type: 'add',
  id: '',
  onClose: () => {},
  onConfirm: () => {}
};

export default BillingItem;
