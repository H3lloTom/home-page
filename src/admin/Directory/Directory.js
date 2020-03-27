import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiCard,
  EuiFlexItem,
  EuiButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea
} from '@elastic/eui';
import schema from 'async-validator';
import styles from './index.module.scss';

const descriptor = {
  name: {
    type: 'string',
    required: true,
    message: '请填写名称'
  },
  description: {
    type: 'string',
    required: true,
    message: '请填写描述信息'
  }
};

const validator = new schema(descriptor);

const Directory = () => {
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const onSave = () => {};
  return (
    <>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiCard></EuiCard>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiButton
        onClick={() => setAddVisible(true)}
        fill
        iconType="plusInCircleFilled"
        className={styles.addBtn}>
        新增
      </EuiButton>
      {addVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={() => setAddVisible(false)}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>新增文件夹</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiForm>
                <EuiFormRow label="名称">
                  <EuiFieldText></EuiFieldText>
                </EuiFormRow>
                <EuiFormRow label="描述">
                  <EuiTextArea></EuiTextArea>
                </EuiFormRow>
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => setAddVisible(false)}>
                取消
              </EuiButtonEmpty>
              <EuiButton isLoading={addLoading} onClick={onSave} fill>
                保存
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
    </>
  );
};

export default Directory;
