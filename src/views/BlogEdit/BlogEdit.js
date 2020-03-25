import React, { Fragment, useState, useEffect } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiControlBar,
  EuiSpacer
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import '@@/styles/md.scss';

const BlogEdit = props => {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const togglePreview = () => {
    setPreview(!preview);
  };
  const controls = [
    {
      controlType: 'button',
      id: 'preview',
      label: '预览',
      onClick: togglePreview
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
        <EuiControlBar
          controls={controls}
          position="relative"
          showOnMobile></EuiControlBar>
        <EuiFormRow fullWidth>
          {preview ? (
            <ReactMarkdown
              className="markdown"
              source={content}></ReactMarkdown>
          ) : (
            <MonacoEditor
              theme="vs-dark"
              height="500"
              value={content}
              onChange={setContent}
              language="markdown"></MonacoEditor>
          )}
        </EuiFormRow>
      </EuiForm>
      <EuiSpacer size="l"></EuiSpacer>
    </Fragment>
  );
};

export default BlogEdit;
