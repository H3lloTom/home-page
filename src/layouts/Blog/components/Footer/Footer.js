import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiLink } from '@elastic/eui';
import styles from './index.module.scss';

const Footer = () => {
  return (
    <EuiFlexGroup justifyContent="spaceAround" className={styles.footer}>
      <EuiFlexItem grow={false}>
        <EuiLink href="http://www.beian.miit.gov.cn" color="text" external>
          浙ICP备19026791号-1
        </EuiLink>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Footer;
