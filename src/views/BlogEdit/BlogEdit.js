import React, { Fragment } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiControlBar,
  EuiSpacer
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';

const BlogEdit = props => {
  const controls = [
    {
      controlType: 'icon',
      id: 'controls_icon',
      iconType: 'flag'
    },
    {
      controlType: 'button',
      id: 'preview',
      label: '预览'
    },
    {
      controlType: 'spacer'
    }
  ];
  return (
    <Fragment>
      <EuiForm>
        <EuiFormRow fullWidth>
          <EuiFilePicker
            fullWidth
            initialPromptText="请选择banner图"></EuiFilePicker>
        </EuiFormRow>
        <EuiFormRow fullWidth>
          <EuiFieldText fullWidth placeholder="请输入标题"></EuiFieldText>
        </EuiFormRow>
        <EuiSpacer size="s"></EuiSpacer>
        <EuiControlBar controls={controls} position="relative"></EuiControlBar>
        <EuiFormRow fullWidth>
          <MonacoEditor
            theme="vs-dark"
            height="500"
            language="markdown"></MonacoEditor>
        </EuiFormRow>
      </EuiForm>
      <EuiSpacer size="l"></EuiSpacer>
    </Fragment>
  );
};

export default BlogEdit;
