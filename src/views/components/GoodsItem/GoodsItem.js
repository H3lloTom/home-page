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
  EuiButtonEmpty,
  EuiFieldNumber,
  EuiTextArea,
  EuiFilePicker,
  EuiListGroup,
  EuiListGroupItem
} from '@elastic/eui';
import PropTypes from 'prop-types';
import AV from 'leancloud-storage';
import schema from 'async-validator';

const descriptor = {
  picture: {
    type: 'object',
    required: true,
    message: '请上传主图'
  },
  name: {
    type: 'string',
    required: true,
    message: '商品名必填'
  },
  itemCode: {
    type: 'string',
    required: true,
    message: '商品编码必填'
  },
  contact: {
    type: 'string',
    required: true,
    message: '联系方式必填'
  },
  price: {
    type: 'integer',
    required: true,
    message: '单价必填'
  },
  description: {
    type: 'string',
    length: 120,
    message: '描述最大输入长度为120'
  }
};
const validator = new schema(descriptor);

const INIT_GOODS = {
  name: '',
  itemCode: '',
  price: 0,
  picture: null,
  description: '',
  contact: ''
};

const GoodsItem = props => {
  const [itemGoods, setItemGoods] = useState(INIT_GOODS);
  const [errors, setErrors] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const onClose = () => {
    props.onClose();
  };
  const onConfirm = async () => {
    try {
      await validator.validate(itemGoods);
    } catch ({ errors }) {
      setConfirmLoading(false);
      setErrors(errors);
      return;
    }
    setErrors([]);
    setConfirmLoading(true);

    if (props.type === 'add') {
      const Goods = AV.Object.extend('Goods');
      const goods = new Goods();
      await goods.save(itemGoods);
    } else if (props.type === 'alter') {
      const goods = AV.Object.createWithoutData('Goods', props.id);
      await goods.save(itemGoods);
    }

    setConfirmLoading(false);
    props.onConfirm();
  };

  const getFormRowProps = label => ({
    display: 'rowCompressed',
    label
  });
  const onChangeItemGoods = (key, val) => {
    const nextItemGoods = {
      ...itemGoods,
      [key]: val
    };
    setItemGoods(nextItemGoods);
  };
  const onChangeFile = files => {
    if (files.length > 0) {
      const fileData = files[0];
      const file = new AV.File(fileData.name, fileData);
      return file.save().then(file => {
        onChangeItemGoods('picture', {
          name: file.get('name'),
          url: file.get('url'),
          id: file.id
        });
      });
    }
    onChangeItemGoods('picture', null);
  };
  const queryItem = async id => {
    const goods = new AV.Query('Goods');
    const res = await goods.get(id);
    setItemGoods({
      name: res.get('name'),
      itemCode: res.get('itemCode'),
      price: res.get('price'),
      picture: res.get('picture'),
      description: res.get('description'),
      contact: res.get('contact')
    });
  };
  useEffect(() => {
    const { type } = props;
    if (type === 'alter') {
      queryItem(props.id);
    }
  }, [props]);
  const errorMessages = errors.map(e => e.message);
  const errorFields = errors.map(e => e.field);
  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {props.type === 'add' ? '新增' : '编辑'}商品
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
            <EuiFormRow
              isInvalid={errorFields.indexOf('picture') !== -1}
              {...getFormRowProps('主图')}>
              {itemGoods.picture ? (
                <EuiListGroup>
                  <EuiListGroupItem
                    label={itemGoods.picture.name}
                    iconType="paperClip"
                    extraAction={{
                      color: 'subdued',
                      onClick: () => onChangeFile([]),
                      iconType: 'trash',
                      iconSize: 's'
                    }}></EuiListGroupItem>
                </EuiListGroup>
              ) : (
                <EuiFilePicker
                  initialPromptText="点击上传主图"
                  isInvalid={errorFields.indexOf('picture') !== -1}
                  accept="image/*"
                  display="large"
                  onChange={onChangeFile}
                  compressed></EuiFilePicker>
              )}
            </EuiFormRow>
            <EuiFormRow
              isInvalid={errorFields.indexOf('name') !== -1}
              {...getFormRowProps('商品名')}>
              <EuiFieldText
                isInvalid={errorFields.indexOf('name') !== -1}
                value={itemGoods.name}
                onChange={e => onChangeItemGoods('name', e.target.value)}
                compressed></EuiFieldText>
            </EuiFormRow>
            <EuiFormRow
              isInvalid={errorFields.indexOf('itemCode') !== -1}
              {...getFormRowProps('商品编码')}>
              <EuiFieldText
                isInvalid={errorFields.indexOf('itemCode') !== -1}
                value={itemGoods.itemCode}
                onChange={e => onChangeItemGoods('itemCode', e.target.value)}
                compressed></EuiFieldText>
            </EuiFormRow>
            <EuiFormRow
              isInvalid={errorFields.indexOf('contact') !== -1}
              {...getFormRowProps('联系方式')}>
              <EuiFieldText
                isInvalid={errorFields.indexOf('contact') !== -1}
                value={itemGoods.contact}
                onChange={e => onChangeItemGoods('contact', e.target.value)}
                compressed></EuiFieldText>
            </EuiFormRow>
            <EuiFormRow
              isInvalid={errorFields.indexOf('price') !== -1}
              {...getFormRowProps('单价')}>
              <EuiFieldNumber
                isInvalid={errorFields.indexOf('price') !== -1}
                value={itemGoods.price}
                onChange={e => onChangeItemGoods('price', +e.target.value)}
                append="￥"
                compressed></EuiFieldNumber>
            </EuiFormRow>
            <EuiFormRow
              isInvalid={errorFields.indexOf('description') !== -1}
              {...getFormRowProps('描述')}>
              <EuiTextArea
                isInvalid={errorFields.indexOf('description') !== -1}
                value={itemGoods.description}
                onChange={e => onChangeItemGoods('description', e.target.value)}
                compressed></EuiTextArea>
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

GoodsItem.propTypes = {
  type: PropTypes.oneOf(['add', 'alter']),
  id: PropTypes.string,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func
};

export default GoodsItem;
