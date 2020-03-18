import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';
import { Topbar, Footer } from './components';
import styles from './index.module.scss';

const Blog = props => {
  const { children } = props;
  return (
    <EuiPage className={styles.page}>
      <EuiPageBody>
        <Topbar></Topbar>
        <EuiPageContent className={styles.content}>
          <EuiPageContentBody>{children}</EuiPageContentBody>
        </EuiPageContent>
        <Footer></Footer>
      </EuiPageBody>
    </EuiPage>
  );
};

export default Blog;
