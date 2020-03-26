import React, { Fragment, useState, useEffect, useReducer } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiStepsHorizontal,
  EuiPanel,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import styles from './index.module.scss';

const BlogEdit = props => {
  const [banner, setBanner] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    {
      title: '填写基本信息',
      isSelected: currentStep === 1,
      onClick: () => setCurrentStep(1),
      id: 'basic'
    },
    {
      title: '写作',
      isSelected: currentStep === 2,
      onClick: () => setCurrentStep(2),
      id: 'writing'
    },
    {
      title: '保存',
      isSelected: currentStep === 3,
      onClick: () => setCurrentStep(3),
      id: 'save'
    }
  ];
  return (
    <Fragment>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiStepsHorizontal steps={steps}></EuiStepsHorizontal>`
        </EuiFlexItem>
        <EuiFlexItem grow>
          <EuiFlexGroup>
            <EuiFlexItem>
              <MonacoEditor
                theme="vs-dark"
                value={content}
                onChange={setContent}
                language="markdown"></MonacoEditor>
            </EuiFlexItem>
            <EuiFlexItem>
              <ReactMarkdown
                className={classnames('markdown', styles.markdownArea)}
                source={content}></ReactMarkdown>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSpacer size="s"></EuiSpacer>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

export default BlogEdit;
